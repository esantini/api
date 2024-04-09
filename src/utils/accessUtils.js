const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');
const { sendEmail } = require('./emailUtils');
const {
  getUser,
  addConversation,
} = require('../database.js');
const os = require('os');

exports.getIsWhitelisted = (req) => {
  const { token } = req.cookies;
  if (!token) return false;

  const { whitelist } = config.oauth;
  const { userId } = jwt.verify(token, config.tokenSecret);

  return whitelist.indexOf(userId) !== -1;
};

exports.getIsAdmin = (req) => {
  const { token } = req.cookies;
  if (!token) return false;

  const { userId } = jwt.verify(token, config.tokenSecret);

  const { admin } = config.oauth;
  const isAdmin = admin.indexOf(userId) !== -1;

  if (!isAdmin) {
    console.error(`Unauthorized Access by ${req.ip}`);
    const geo = geoip.lookup(req.ip);
    sendEmail({
      subject: 'Unauthorized Access Attempt',
      text: `
        Unauthorized Access from <b>${req.ip}</b> <br /><br />
        IP Address: <b>${req.ip}</b> <br /><br />
        Timestamp: <b>${new Date().toISOString()}</b> <br /><br />
        Requested URL: <b>${req.originalUrl}</b> <br /><br />
        HTTP Method: <b>${req.method}</b> <br /><br />
        User Agent: <b>${req.headers['user-agent']}</b> <br /><br />
        Request Body: <b>${JSON.stringify(req.body)}</b> <br /><br />
        Referrer: <b>${req.headers['referrer']}</b> <br /><br />
        Request Headers: <b>${JSON.stringify(req.headers)}</b> <br /><br />
        Geo: <b>${JSON.stringify(geo)}</b>
    ` });
  }

  return isAdmin;
};

const getUserFromToken = (token) => {
  try {
    if (!token) return null;
    const { userId } = jwt.verify(token, config.tokenSecret);
    const user = getUser(userId);
    const { admin, whitelist } = config.oauth;
    user.isAdmin = admin.indexOf(userId) !== -1;
    user.isWhitelisted = whitelist.indexOf(userId) !== -1;
    return user;
  } catch (error) {
    res.clearCookie('token');
    if (error.name === 'TokenExpiredError') {
      return null;
    } else {
      console.error('/api/me', { error });
      sendEmail({ subject: 'Server Error', text: `Error in /api/me: ${error}` });
      return null;
    }
  }
};
exports.getUserFromToken = getUserFromToken;

/**
 * Get chatId from user token or create a new one for guest users
 * @param {Object} cookies
 * @param {Object} res
 * @returns {String} chatId
 */
exports.getChatId = ({ token, chatIdToken }, res) => {
  // console.log('getChatId: ', { token, chatIdToken });
  const user = getUserFromToken(token);
  let chatId;

  if (chatIdToken) {
    try {
      chatId = jwt.verify(chatIdToken, config.tokenSecret)?.chatId;
    }
    catch (error) {
      if (error.name === 'TokenExpiredError') {
        res.clearCookie('chatIdToken');
      } else {
        console.error('Error in getChatId(): ', error);
        sendEmail({ subject: 'Server Error', text: `Error getting chatId: ${error}` });
      }
    }
  }

  // create unique chatId for guest user's token
  if (!user && !chatId) {
    if (!res) {
      console.error('getChatId: unable to set cookie chatIdToken');
      return null;
    }
    const newConversation = addConversation();
    const newChatId = newConversation.$loki;
    const newToken = jwt.sign({ chatId: newChatId }, config.tokenSecret, { expiresIn: '1d' });
    res.cookie('chatIdToken', newToken, { httpOnly: true, secure: config.ssl, sameSite: 'Strict' });
    return newChatId;
  } else {
    if (user?.isAdmin) return chatId;
    return user ? user.chatId : chatId;
  }
};

exports.setChatId = (chatId, res) => {
  const chatIdToken = jwt.sign({ chatId }, config.tokenSecret, { expiresIn: '1d' });
  res.cookie('chatIdToken', chatIdToken, { httpOnly: true, secure: false, sameSite: 'Strict' }); // TODO secure: config.ssl
}

exports.getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
};
