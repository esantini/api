const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils');
const { addUser, getUser, addConversation } = require('../database');

const googleOauth = (app) => {
  // set "web" in privateConfig.json file
  if (config.oauth.web) {
    const client = new OAuth2Client(config.oauth.web.client_id);

    app.use(cookieParser());

    app.post('/api/auth/google', async (req, res) => {
      const { body: { idToken } } = req;
      const ticket = await client.verifyIdToken({
        idToken,
        audience: config.oauth.web.client_id,
      });

      const { name, email, picture, given_name, sub, aud, exp } = ticket.getPayload();

      const isExpired = exp * 1000 < Date.now();
      if (aud !== config.oauth.web.client_id || isExpired) {
        res.status(400).json({ msg: 'Invalid Token' });
        return;
      }
      console.log({ sub });

      const user = getUser(sub);

      if (!user) {
        const newUser = { name, email, picture, given_name, userId: sub };
        const { chatIdToken } = req.cookies;
        let chatId;

        if (chatIdToken) {
          try {
            chatId = jwt.verify(chatIdToken, config.tokenSecret)?.chatId;
          }
          catch (error) {
            if (error.name !== 'TokenExpiredError') {
              console.log('/api/auth/google', { error });
              sendEmail({ subject: 'Server Error', text: `Error in /api/auth/google: ${error}` });
            }
          }
          res.clearCookie('chatIdToken');
        }
        if (chatId) {
          // If user was chatting as guest he'll keep his chatId
          newUser.chatId = chatId;
        }
        else {
          const newConversation = addConversation();
          newUser.chatId = newConversation.$loki;
        }
        addUser(newUser);
      }

      // if it isn't whitelisted user, send email
      if (config.oauth.whitelist.indexOf(sub) === -1) {
        sendEmail({
          subject: user ? 'User Logged Back In' : 'New User Logged in',
          text: `${user ? '' : 'New '} User Logged in: ${name} ${email}`,
        });
      }

      const newToken = jwt.sign({ userId: sub }, config.tokenSecret, { expiresIn: '3d' });
      res.cookie('token', newToken, { httpOnly: true, secure: config.ssl, sameSite: 'Strict' });
      const isWhitelisted = config.oauth.whitelist.indexOf(sub) !== -1;
      const isAdmin = config.oauth.admin.indexOf(sub) !== -1;
      res.status(200).json({ name, picture, isWhitelisted, isAdmin });
    });

    app.delete('/api/auth/logout', (req, res) => {
      res.clearCookie('token');
      res.status(200).json({ msg: 'Logged out successfully' });
    });
  }
}

module.exports = googleOauth;
