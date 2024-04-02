const { db } = require('../database');

const handleRequestChat = (req, res) => {
  let chatId;
  let user;

  const { token } = req.cookies;
  if (token) {
    try {
      user = jwt.verify(token, config.tokenSecret);
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

  // create unique chatId for guest user's token
  if (!user) {
    chatId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  } else {
    chatId = user.chatId;
    console.log('user has chatId', { chatId }); // TODO remove
  }

  const messagesCollection = db.getCollection('messages');
  const chat = messagesCollection.findOne({ chatId });

  if (!chat) {
    messagesCollection.insert({ chatId, messages: [] });
  }

  sendEmail({
    to: config.email.myAddress,
    subject: 'Chat Request',
    text: `Chat Request from ${user ? user.name : req.body?.name}`,
  });

  // refresh token if user is not logged in
  if (!user?.email) {
    const newToken = jwt.sign({ chatId }, config.tokenSecret, { expiresIn: '1m' });
    res.cookie('token', newToken, { httpOnly: true, secure: config.ssl, sameSite: 'Strict' });
  }

  res.sendStatus(200);
};

module.exports = handleRequestChat;
