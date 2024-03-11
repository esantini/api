const { addMessage } = require('../database');
const lcd = require('./lcd_controller');
const inlineCSS = require('inline-css');

let mailgun;

if (config.email.enabled) {
  mailgun = require('mailgun-js')({
    domain: `mg.${config.domain}`,
    apiKey: config.email.mailgun_api_key,
  });
}

const getTemplate = (text) => `
<div>
  <style>
    h2 { color: #d7b065; }
    img.logo { width: 120px }
  </style>
  ${text}
  <br />
  <img class="logo" src="https://esantini.com/logo.png" />
</div>
`;

const getMessage = async ({ to, subject, text, from }) => {
  const html = await inlineCSS(getTemplate(text), { url: 'fake' });
  return {
    from: from || 'eSantini Web <no-reply@esantini.com>',
    to,
    subject,
    html,
  };
}

const sendEmail = async (emailObj) => {
  if (!config.email.enabled) return console.log('"Sending" email: ', emailObj.subject);

  const message = await getMessage(emailObj);
  console.log("Sending email: ", emailObj.subject);

  mailgun.messages().send(message, (error, body) => {
    if (error) throw error;
    console.log('Mail Sent: ', body.id);
  });
}

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
