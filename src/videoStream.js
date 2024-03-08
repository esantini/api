const pythons = require('./python');

let lastFrameObj = {
    lastFrame: null
};

const videoStream = {
    getLastFrame: () => {
        return lastFrameObj.lastFrame;
    },
    acceptConnections: function (expressApp, cameraOptions, resourcePath, isVerbose) {
        const raspberryPiCamera = require('raspberry-pi-camera-native');

        if (!cameraOptions) {
            cameraOptions = {
                width: 1280,
                height: 720,
                fps: 16,
                encoding: 'JPEG',
                quality: 7
            };
        }

        // start capture
        raspberryPiCamera.start(cameraOptions);
        if (isVerbose) console.log('Camera started.');

        if (typeof resourcePath === 'undefined' || !resourcePath) {
            resourcePath = '/stream.mp4';
        }

        expressApp.get(resourcePath, (req, res) => {

            res.writeHead(200, {
                'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
                Pragma: 'no-cache',
                Connection: 'close',
                'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary'
            });
            if (isVerbose) console.log('Accepting connection: ' + req.hostname);

            addCounter();

            // add frame data event listener

            let isReady = true;
            let frameHandler = (frameData) => {
                try {
                    if (!isReady) return;
                    isReady = false;
                    if (isVerbose) console.log('Writing frame: ' + frameData.length);

                    lastFrameObj.lastFrame = frameData;

                    res.write(`--myboundary\nContent-Type: image/jpg\nContent-length: ${frameData.length}\n\n`);
                    res.write(frameData, function () {
                        isReady = true;
                    });
                }
                catch (ex) {
                    if (isVerbose) console.log('Unable to send frame: ' + ex);
                }
            }

            const frameEmitter = raspberryPiCamera.on('frame', frameHandler);

            req.on('close', () => {
                frameEmitter.removeListener('frame', frameHandler);
                subCounter();
                if (isVerbose)
                    console.log('Connection terminated: ' + req.hostname);
            });
        });
    }
}

module.exports = videoStream;

let counterReport;
let counter = 0;

const addCounter = () => {
    counter++;
    if (counter === 1) {
        pythons.beep(0.1);
        pythons.setLight(true);
        counterReport = setInterval(() => {
            console.log(`people watching: ${counter}`)
        }, 1000);
    }
}
const subCounter = () => {
    counter--;
    if (counter === 0) {
        pythons.setLight(false);
        clearInterval(counterReport);
    }
}