const pythons = require('./python');
const { getIsWhitelisted } = require('./utils');
const raspberryPiCamera = require('raspberry-pi-camera-native');

class VideoStream {
  constructor() {
    this.counter = 0;
    this.counterReport = null;
    this.isVerbose = false;
    raspberryPiCamera.start({
      width: 1280,
      height: 720,
      fps: 4,
      encoding: 'JPEG',
      quality: 4, // lower is faster
    }, () => {
      if (this.isVerbose) console.log('Camera started.');
    });
  }

  addCounter() {
    this.counter++;

    if (this.counter === 1) {
      pythons.setLight(true);
    }
    if (this.counter >= 1) {
      pythons.beep(0.1);
      if (!this.counterReport && this.isVerbose) {
        this.counterReport = setInterval(() => {
          console.log(`People watching: ${this.counter}`);
        }, 10000);
      }
    }
    if (this.counter > 1 && this.isVerbose) {
      console.log(`1 more watching: ${this.counter}`);
    }
  }

  subCounter() {
    this.counter--; // TODO test if (--this.counter) works
    if (this.counter === 0) {
      pythons.setLight(false);
      console.log(`People watching: ${this.counter}`);
      if (this.counterReport) clearInterval(this.counterReport);
    }
  }

  acceptConnections(expressApp, resourcePath, isVerbose) {
    this.isVerbose = isVerbose;

    expressApp.get(resourcePath, (req, res) => {
      if (getIsWhitelisted(req)) {
        this.addCounter();
        res.writeHead(200, {
          'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
          Pragma: 'no-cache',
          Connection: 'close',
          'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary'
        });
        if (this.isVerbose) console.log('Accepting connection: ' + req.hostname);

        let isReady = true;
        let frameHandler = (frameData) => {
          if (!isReady) return;
          isReady = false;

          res.write(`--myboundary\nContent-Type: image/jpg\nContent-length: ${frameData.length}\n\n`);
          res.write(frameData, () => isReady = true);
        }

        const frameEmitter = raspberryPiCamera.on('frame', frameHandler);

        req.on('close', () => {
          frameEmitter.removeListener('frame', frameHandler);
          this.subCounter();
          if (this.isVerbose) console.log('Connection terminated: ' + req.hostname);
        });
      } else {
        res.status(418).json({ msg: 'you must be whitelisted' });
      }
    });
  }
}

module.exports = VideoStream;
