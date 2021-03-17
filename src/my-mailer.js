const inlineCSS = require('inline-css');

let mailgun;

if (config.emailEnabled) {
  mailgun = require('mailgun-js')({
    domain: `mg.${config.domain}`,
    apiKey: config.mailgun_api_key,
  });
}

const getTemplate = (name, text, sayHi) => `
<div>
  <style>
    h2 { color: #032033; }
  </style>

  ${sayHi && name ? `<h2>Hola ${name}!</h2>` : ''}
  <br/>
  ${text}
</div>
`;

exports.send = async function ({ to, subject, name, text, sayHi = true, from }) {
  if (!config.emailEnabled) return console.log('"Sending" email: ', subject);

  const html = await inlineCSS(getTemplate(name, text, sayHi), { url: 'fake' });

  const message = {
    from: from || 'eSantini Web <no-reply@esantini.com>',
    to,
    subject,
    html,
    text: `${sayHi && name ? `Hola ${name}!\n\n` : ''} ${text}`
  };
  console.log("Sending email: ", subject);

  await mailgun.messages().send(message, (error, body) => {
    if (error) throw error;
    console.log('Mail Sent: ', body.id);
  });
}