require('./init.js'); // Sets global.config from api/config.json && privateConfig.json
const express = require('express');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');

const senseHat = require('./senseHat');
const VideoStream = require('./videoStream');
const {
  getMessage,
  getWeddingMessages,
  addEvent,
  getEvents,
  addSession,
  getSessions,
  deleteSession,
  getWorldPoints,
} = require('./database');
const myGoogleOauth = require('./auth/googleOauth');
const {
  getLight,
  setLight,
  processMessage,
  getIsAdmin,
  getIsWhitelisted,
  processWeddingMessage,
} = require('./utils');

require('./webSocket');

const IS_PROD = config.env === 'prod';
console.log({ IS_PROD });

const app = express();
app.use(express.json());
app.set('port', config.apiPort);
app.set('trust proxy', true);

if (IS_PROD) {
  // Express only serves static assets in production
  app.use(express.static('client/build'));
  require('./deploy')(app);
}

myGoogleOauth(app);

app.get('/api/me', (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(200).json({});
    const { name, picture } = jwt.verify(token, config.tokenSecret);
    res.status(200).json({
      name,
      picture,
      isWhitelisted: getIsWhitelisted(req),
      isAdmin: getIsAdmin(req),
    });
  } catch (error) {
    console.log('/api/me', { error });
    res.clearCookie('token');
    res.status(401).json({ msg: 'Unauthorized' });
  }
});

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

app.post('/api/event', (req, res) => {
  const { type, details, sessionId } = req.body;
  const ip = req.ip;

  const geo = geoip.lookup(ip);

  const session = addSession({ sessionId, geo });
  addEvent({ type, details, sessionId: session.$loki, timestamp: new Date() });

  res.sendStatus(200);
});
app.get('/api/event', (req, res) => {
  res.json(getEvents());
});
app.get('/api/sessions', (req, res) => {
  res.json(getSessions());
});
app.delete('/api/sessions', (req, res) => {
  const id = parseInt(req.query.id);
  if (getIsAdmin(req) && id > -1) {
    deleteSession(id);
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});
app.get('/api/worldpoints', (req, res) => {
  const days = req.query.days || 7;
  res.json(getWorldPoints(days));
});

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
videoStream.acceptConnections(app, '/api/stream.mp4', true);

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
