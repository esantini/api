const WebSocket = require('ws');
const { getUserFromToken, getChatId } = require('./utils');
const { db } = require('./database');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

const parseCookies = (cookieString = '') => {
  const cookies = {};
  cookieString?.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    cookies[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return cookies;
};

wss.on('connection', function connection(ws, req) {
  const { token, chatIdToken } = parseCookies(req.headers?.cookie);
  // console.log({ token, chatIdToken });

  const user = getUserFromToken(token);
  const { userId, given_name, isAdmin } = user ? user : {};

  const chatId = getChatId({ token: isAdmin ? undefined : token, chatIdToken });
  if (!chatId) console.error('Chatting witouth a chatId');
  const messagesCollection = db.getCollection('chatMessages');
  ws.chatId = chatId;

  ws.on('error', (error) => console.error(error));
  ws.on('open', function open() {
    console.log('WebSocket Opened, sending something');
    ws.send('something');
  });
  ws.on('close', function close() {
    console.log('WebSocket Disconnected');
  });
  ws.on('message', function incoming(data, isBinary) {
    // Broadcast incoming message to all clients

    const { message, name } = JSON.parse(data.toString());
    if (chatId) messagesCollection.insert({
      message,
      name: given_name ? given_name : name,
      chatId,
      userId,
    });

    console.log('WebSocket sending message. chatId: ', chatId);
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN && chatId === client.chatId) {
        client.send(data, { binary: isBinary });
      }
      else console.log('client.readyState Not Open');
    });
  });
});
