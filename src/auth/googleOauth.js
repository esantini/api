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

      addUser(user);

      const token = jwt.sign(user, config.tokenSecret, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: config.ssl, sameSite: 'Strict' });
      const isWhitelisted = config.oauth.whitelist.indexOf(email) !== -1;
      const isAdmin = config.oauth.admin.indexOf(email) !== -1;
      res.status(200).json({ name, picture, isWhitelisted, isAdmin });
    });

    app.delete('/api/auth/logout', (req, res) => {
      res.clearCookie('token');
      res.status(200).json({ msg: 'Logged out successfully' });
    });
  }
}

module.exports = googleOauth;
