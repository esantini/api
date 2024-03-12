const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('connection', function connection(ws) {
  console.log('WebSocket Connected');

  ws.on('error', (error) => console.error(error));
  ws.on('open', function open() {
    console.log('WebSocket Opened, sending something');
    ws.send('something');
  });
  ws.on('close', function close() {
    console.log('WebSocket Disconnected');
  });
  ws.on('message', function incoming(data, isBinary) {
    console.log('WebSocket Message:', { data, isBinary });

    // Broadcast incoming message to all clients
    wss.clients.forEach(function each(client) {
      console.log('WebSocket sending to client');
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
      else console.log('client.readyState Not Open');
    });
  });
});
