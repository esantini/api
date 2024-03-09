const { OAuth2Client } = require('google-auth-library');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const LokiStore = require('connect-loki')(session);
const { addUser } = require('../database');

const googleOauth = (app) => {
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
      res.json(user ? user : null);
    });
  }
}

module.exports = googleOauth;
