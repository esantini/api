require('./init.js'); // Sets global.config from api/config.json && privateConfig.json
const express = require('express');

const senseHat = require('./senseHat');
const VideoStream = require('./videoStream');
const { getMessage, getWeddingMessages } = require('./database');
const myGoogleOauth = require('./auth/googleOauth');

const {
  getLight,
  setLight,
  processMessage,
  processWeddingMessage,
} = require('./utils');

const IS_PROD = config.env === 'prod';
console.log({ IS_PROD });

const app = express();
app.use(express.json());
app.set('port', config.apiPort);

if (IS_PROD) {
  // Express only serves static assets in production
  app.use(express.static('client/build'));
  require('./deploy')(app);
}

myGoogleOauth(app);

// disable sense-HAT in 'config.json'
if (config.senseHatEnabled) {
  try {
    senseHat(app);
  }
  catch (ex) {
    console.log({ ex });
  }
} else {
  app.get('/api/weather', (req, res) =>
    res.json({ msg: 'Sense-HAT not Available' })
  );
}

app.post('/api/wedding-message', (req, res) => {
  if (req.body?.message) {
    processWeddingMessage(req);
  }
  res.sendStatus(200);
});
app.get('/api/wedding-messages', (req, res) => {
  res.json(getWeddingMessages());
});

app.get('/api/message', (req, res) => res.json({ message: getMessage() }));
app.post('/api/message', (req, res) => {
  if (req.body?.message) {
    processMessage(req);
  }
  res.sendStatus(200);
});

app.post('/api/light', (req, res) => {
  res.sendStatus(200);
  setLight(req.body?.status);
});
// On Start Up: blink 3 times
setLight(true, false);
setTimeout(() => setLight(false, false), 200);
setTimeout(() => setLight(true, false), 400);
setTimeout(() => setLight(false, false), 600);
setTimeout(() => setLight(true, false), 800);
setTimeout(() => setLight(false, false), 1000);

app.get('/api/light', (req, res) => res.json({ light: getLight() }));

const videoStream = new VideoStream();
videoStream.acceptConnections(app, {
  width: 1280,
  height: 720,
  fps: 16,
  encoding: 'JPEG',
  quality: 7, //lower is faster
}, '/api/stream.mp4', true);

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
