require('./init.js'); // Sets global.config from api/config.json && privateConfig.json
const express = require('express');

const senseHat = require('./senseHat');
const videoStream = require('./videoStream');
const {
  getMessage,
  getWeddingMessages,
  init: dbInit,
} = require('./database');
const {
  getLight,
  setLight,
  processMessage,
  processWeddingMessage,
} = require('./utils');

const IS_PROD = config.env === 'prod';

const app = express();
app.use(express.json());
app.set('port', config.apiPort);

if (IS_PROD) {
  // Express only serves static assets in production
  app.use(express.static('client/build'));
  require('./deploy')(app);
}

// LED message in sense-hat:
let message = 'Hello World!';
// cannot getMessage() before database is initialized so set message in dbInit(cb)
dbInit(() => (message = getMessage()));

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

app.get('/api/message', (req, res) => res.json({ message }));
app.post('/api/message', (req, res) => {
  if (req.body?.message) {
    message = req.body.message;
    processMessage(req);
  }
  res.sendStatus(200);
});

// app.post('/api/light', (req, res) => {
//   res.sendStatus(200);
//   setLight(req.body?.status);
// });
app.get('/api/light', (req, res) => res.json({ light: getLight() }));

videoStream.acceptConnections(app, {
  width: 1280,
  height: 720,
  fps: 3,
  encoding: 'JPEG',
  quality: 7, //lower is faster
}, '/api/stream.mp4', true);

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
