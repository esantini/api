const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { addWeddingMessage, addMessage } = require('./database');
const pythons = require('./python');
const sendEmail = require('./my-mailer').send;
const constants = require('./constants');
const lcd = require('./lcd_controller');

exports.validateJsonWebhook = (request) => {
  if (!config.git_webhook_secret) return false;
  // calculate the signature
  const expectedSignature =
    'sha1=' +
    crypto
      .createHmac('sha1', config.git_webhook_secret)
      .update(JSON.stringify(request.body))
      .digest('hex');

  // compare the signature against the one in the request
  const signature = request.headers['x-hub-signature'];
  if (signature !== expectedSignature) {
    throw new Error('Invalid signature.');
  }
  return true;
};

exports.processMessage = (req) => {
  const { message } = req.body;
  console.log(new Date(), ` setting message ${message}`);

  lcd.showMessage(message);

  addMessage({
    message,
    ip: req.headers['x-forwarded-for'],
  });
  // sendSMS(message);
  if (config.email?.enabled) {
    sendEmail({
      from: 'e-Santini <no-reply@esantini.com>',
      subject: 'e-Santini Message',
      to: config.email?.myAddress,
      text: `<h2>New Message!</h2> ${message}`,
    });
  }
}

exports.processWeddingMessage = (req) => {
  const { name, message, email } = req.body;
  addWeddingMessage({
    name,
    email,
    message,
    ip: req.headers['x-forwarded-for'],
  });
  sendSMS(`FROM: ${name}. MSG: ${message}`);
  sendEmail({
    from: 'Ana Karen & Esteban <no-reply@esantini.com>',
    subject: constants.emails.weddingGracias.subject,
    to: email,
    text: `<h2>Hola ${name}!</h2> ${constants.emails.weddingGracias.text}`,
  });

  sendEmail({
    from: `${name.trim()} <no-reply@esantini.com>`,
    subject: 'Felicitaciones!',
    text: `De: ${name} <br />${email ? `Email: ${email}<br />` : ''}<br /> ${message.replace(/(?:\r\n|\r|\n)/g, '<br />')}`,
    to: ['esantinie@gmail.com', 'ana.tamaurab@gmail.com'],
  });
}

let isLightOn = false;
exports.setLight = (value, isVerbose = true) => {
  // toggle if there is no value

  isLightOn = value === undefined ? !isLightOn : value;

  if (isVerbose) console.log(`Turning Light: ${isLightOn ? 'ON' : 'OFF'}`);

  pythons.setLight(isLightOn).stdout.on('data', (data) => {
    // if (isVerbose) console.log({ data });
  });
}
exports.getLight = () => isLightOn;

// TODO whitelist from DB
exports.getIsWhitelisted = (req) => {
  const { token } = req.cookies;
  if (!token) return false;

  const { whitelist } = config.oauth;
  const { email } = jwt.verify(token, config.tokenSecret);

  return whitelist.indexOf(email) !== -1;
}
