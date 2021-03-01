require('./init.js'); // Sets global.config from api/config.json && privateConfig.json
const express = require('express');
const {
  addMessage,
  addWeddingMessage,
  getMessage,
  getWeddingMessages,
  init: dbInit,
} = require('./database');
const { validateJsonWebhook } = require('./utils');
const deploy = require('./deploy');
let sendSMS;
if (config.smsEnabled) sendSMS = require('./sendSms');

const IS_PROD = config.env === 'prod';

const app = express();
app.use(express.json());
app.set('port', config.apiPort);

// Express only serves static assets in production
if (IS_PROD) {
  app.use(express.static('client/build'));
}

// LED message in sense-hat:
let message = 'Hello World!';
// cannot getMessage() before database is initialized so set message in dbInit(cb)
dbInit(() => (message = getMessage()));

// disable sense-HAT in 'config.json'
if (config.senseHatEnabled) {
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
    const { name, message, email } = req.body;
    addWeddingMessage({
      name,
      email,
      message,
      ip: req.headers['x-forwarded-for'],
    });
    if (config.smsEnabled) sendSMS(message);
  }
  res.sendStatus(200);
});
app.get('/api/wedding-messages', (req, res) => {
  res.json(getWeddingMessages());
});

app.post('/api/git-push', (req, res) => {
  let error = validateJsonWebhook(req) ? null : 'Invalid Request';
  if (error) {
    console.warn(error);
    return res.sendStatus(401);
  } else res.sendStatus(200);

  deploy(req.body, (err) => (error = err));
  if (error) console.warn(error);
});

app.get('/api/message', (req, res) => res.json({ message }));
app.post('/api/message', (req, res) => {
  if (req.body?.message) {
    message = req.body.message;
    console.log(new Date(), ` setting message ${message}`);
    addMessage({
      message,
      ip: req.headers['x-forwarded-for'],
    });
    if (config.smsEnabled) sendSMS(message);
  }
  res.sendStatus(200);
});
