const crypto = require('crypto');
const { addWeddingMessage, addMessage } = require('./database');
const sendSMS = require('./sendSms');
const sendEmail = require('./my-mailer').send;
const constants = require('./constants');

const validateJsonWebhook = (request) => {
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

exports.validateJsonWebhook = validateJsonWebhook;

exports.processMessage = (req) => {
  const { message } = req.body;
  console.log(new Date(), ` setting message ${message}`);
  addMessage({
    message,
    ip: req.headers['x-forwarded-for'],
  });
  sendSMS(message);
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
    from: "Ana Karen & Esteban <no-reply@esantini.com>",
    subject: constants.emails.weddingGracias.subject,
    to: email,
    text: `<h2>Hola ${name}!</h2> ${constants.emails.weddingGracias.text}`,
  });

  sendEmail({
    from: `${name.trim()} <no-reply@esantini.com>`,
    subject: `Felicitaciones!`,
    text: `De: ${name} <br />${email ? `Email: ${email}<br />` : ''}<br /> ${message.replace(/(?:\r\n|\r|\n)/g, '<br />')}`,
    to: ['esantinie@gmail.com', 'ana.tamaurab@gmail.com'],
  });
}
