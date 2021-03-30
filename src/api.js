require('./init.js'); // Sets global.config from api/config.json && privateConfig.json
const express = require('express');
const {
  getMessage,
  getWeddingMessages,
  init: dbInit,
} = require('./database');
const {
  processMessage,
  processWeddingMessage,
} = require('./utils');

const IS_PROD = config.env === 'prod';

const app = express();
app.use(express.json());
app.set('port', config.apiPort);

if (IS_PROD) {
  // Express only serves static assets in production
  app.use(express.static('client/build'));
  require('./deploy')(app);
}

// LED message in sense-hat:
let message = 'Hello World!';
// cannot getMessage() before database is initialized so set message in dbInit(cb)
dbInit(() => (message = getMessage()));

// disable sense-HAT in 'config.json'
if (config.senseHatEnabled) {
  try {
    const senseLeds = require('sense-hat-led');
    const imu = require('node-sense-hat').Imu;
    const IMU = new imu.IMU();
    app.get('/api/weather', (req, res) => {
      //   const param = req.query.q;

      IMU.getValue((error, data) => {
        if (error !== null) {
          console.error('Could not read sensor data: ', error);
          return res.json({
            msg: 'Could not read sensor data',
            error,
          });
        }
        console.log(new Date(), ' sending sensor data');
        return res.json(data);
      });
    });

    if (IS_PROD) {
      startShowMessage();
      function startShowMessage() {
        senseLeds.showMessage(` ${message} `, 0.1, [64, 0, 0], startShowMessage);
      }
    }
  }
  catch (ex) {
    console.log({ ex });
  }
} else {
  app.get('/api/weather', (req, res) =>
    res.json({ msg: 'Sense-HAT not Available' })
  );
}

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});

app.post('/api/wedding-message', (req, res) => {
  if (req.body?.message) {
    processWeddingMessage(req);
  }
  res.sendStatus(200);
});
app.get('/api/wedding-messages', (req, res) => {
  res.json(getWeddingMessages());
});

app.get('/api/message', (req, res) => res.json({ message }));
app.post('/api/message', (req, res) => {
  if (req.body?.message) {
    message = req.body.message;
    processMessage(req);
  }
  res.sendStatus(200);
});
