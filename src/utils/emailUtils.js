const inlineCSS = require('inline-css');
const mailgunJs = require('mailgun-js');

let mailgun;
if (config.email.enabled) {
  mailgun = mailgunJs({
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

const getMessage = async ({
  text,
  subject,
  to = config.email?.myAddress,
  from = 'e-Santini <no-reply@esantini.com>' }
) => {
  const html = await inlineCSS(getTemplate(text), { url: 'fake' });
  return { from, to, subject, html };
}

const sendEmail = async (emailObj, isVerbose) => {
  if (!config.email.enabled) return console.log('"Sending" email: ', emailObj.subject);

  const message = await getMessage(emailObj);

  mailgun.messages().send(message, (error) => {
    if (error) throw error;
    if (isVerbose) console.log('Mail Sent: ', emailObj.subject);
  });
}

module.exports = { sendEmail };
