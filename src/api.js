require('./init.js'); // Sets global.config from api/config.json && privateConfig.json
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const LokiStore = require('connect-loki')(session);

const { OAuth2Client } = require('google-auth-library');

const senseHat = require('./senseHat');
const VideoStream = require('./videoStream');
const { getMessage, getWeddingMessages, addUser } = require('./database');
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

// set "web" in privateConfig.json file
if (config.oauth.web) {
  const client = new OAuth2Client(config.oauth.web.client_id);

  app.use(cookieParser());
  const sOptions = {
    secret: config.sessionSecret,
    store: new LokiStore({
      path: config.database,
    }),
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    }
  };
  if (config.ssl) {
    app.set('trust proxy', 1);
    sOptions.cookie.secure = true;
  }
  app.use(session(sOptions));

  app.post("/api/auth/google", async (req, res) => {
    const { body: { idToken }, session } = req;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();
    const user = { name, email, picture };

    // TODO whitelist from DB
    const { whitelist } = config.oauth;
    if (whitelist.indexOf(email) !== -1) {
      addUser(user);
      session.cookie.user = user;
      res.status(201);
      res.json(user);
    } else {
      res.status(418);
      res.json({ msg: 'you must be whitelisted' });
    }
  });

  app.delete("/api/auth/logout", async (req, res) => {
    await req.session.destroy();
    res.status(200);
    res.json({
      msg: "Logged out successfully"
    });
  });

  app.get("/api/me", async (req, res) => {
    const { user } = req.session.cookie;
    res.status(200);
    res.json(user ? user : { name: 'nobody' });
  });
}

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
setTimeout(() => setLight(true, false), 1000);
setTimeout(() => setLight(false, false), 1200);
setTimeout(() => setLight(true, false), 1400);
setTimeout(() => setLight(false, false), 1600);
setTimeout(() => setLight(true, false), 1800);
setTimeout(() => setLight(false, false), 2000);

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
