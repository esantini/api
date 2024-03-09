const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { addUser } = require('../database');

const googleOauth = (app) => {
  // set "web" in privateConfig.json file
  if (config.oauth.web) {
    const client = new OAuth2Client(config.oauth.web.client_id);

    app.use(cookieParser());

    app.post('/api/auth/google', async (req, res) => {
      const { body: { idToken } } = req;
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

        const token = jwt.sign(user, config.tokenSecret, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, secure: config.ssl, sameSite: 'Strict' });
        res.status(201).json(user);
      } else {
        res.status(418).json({ msg: 'you must be whitelisted' });
      }
    });

    app.delete('/api/auth/logout', (req, res) => {
      res.clearCookie('token');
      res.status(200).json({ msg: 'Logged out successfully' });
    });

    app.get('/api/me', (req, res) => {
      try {
        const { token } = req.cookies;
        if (!token) return res.status(200);
        const { name, picture } = jwt.verify(token, config.tokenSecret);
        res.status(200).json({ name, picture });
      } catch (error) {
        res.clearCookie('token');
        res.status(401).json({ msg: 'Unauthorized' });
      }
    });
  }
}

module.exports = googleOauth;
