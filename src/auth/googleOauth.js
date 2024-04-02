const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { addUser } = require('../apollo/database');

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
      let chatId;

      const { token } = req.cookies;
      if (token) {
        try {
          chatId = jwt.verify(token, config.tokenSecret).chatId;
        }
        catch (error) {
          if (error.name === 'TokenExpiredError') {
            res.clearCookie('token');
          } else {
            console.log('/api/requestChat', { error });
            sendEmail({ subject: 'Server Error', text: `Error in /api/requestChat: ${error}` });
          }
        }
      }

      if (chatId) {
        // If user was chatting as guest he'll keep his chatId
        user.chatId = chatId;
      }
      else {
        // if it's new user he'll get new chatId, otherwise this will be ignored when fetching user
        user.chatId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      }

      const { isNew } = addUser(user);

      // if it isn't whitelisted user, send email
      if (config.oauth.whitelist.indexOf(email) === -1) {
        sendEmail({
          to: config.email.myAddress,
          subject: isNew ? 'New User Logged in' : 'User Logged Back In',
          text: `${isNew ? 'New ' : ''} User Logged in: ${name} ${email}`,
        });
      }

      const newToken = jwt.sign(user, config.tokenSecret, { expiresIn: '1d' });
      res.cookie('token', newToken, { httpOnly: true, secure: config.ssl, sameSite: 'Strict' });
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
