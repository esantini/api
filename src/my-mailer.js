const inlineCSS = require('inline-css');

let mailgun;

if (config.emailEnabled) {
  mailgun = require('mailgun-js')({
    domain: `mg.${config.domain}`,
    apiKey: config.mailgun_api_key,
  });
}

const getTemplate = (text) => `
<div>
  <style>
    h2 { color: #d7b065; }
    img.logo { width: 120px }
  </style>
  ${text}
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

exports.send = async (emailObj) => {
  if (!config.emailEnabled) return console.log('"Sending" email: ', emailObj.subject);

  const message = await getMessage(emailObj);
  console.log("Sending email: ", emailObj.subject);

  mailgun.messages().send(message, (error, body) => {
    if (error) throw error;
    console.log('Mail Sent: ', body.id);
  });
}