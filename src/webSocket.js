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
  console.log('WebSocket Connected');

  const { token, chatIdToken } = parseCookies(req.headers?.cookie);
  console.log({ token, chatIdToken });

  const { userId, given_name } = getUserFromToken(token);
  const chatId = getChatId({ token, chatIdToken });
  if (!chatId) console.error('Chatting witouth a chatId');
  const messagesCollection = db.getCollection('chatMessages');

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
      userId
    });

    wss.clients.forEach(function each(client) {
      console.log('WebSocket sending to client');
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
      else console.log('client.readyState Not Open');
    });
  });
});
