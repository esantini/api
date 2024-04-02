const { addWeddingMessage } = require('../apollo/database');

const weddingGracias = {
  subject: 'Auto-Reply: Gracias!',
  text: `
    <p>
      Gracias por tomarte el tiempo en dejarnos un mensaje!<br/>
      Mas al ratito te leemos y te contestamos.
    </p>
    </br >
    Saluditos =)
    <h3>Ana Karen & Esteban</h3>`
};

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
    subject: weddingGracias.subject,
    to: email,
    text: `<h2>Hola ${name}!</h2> ${weddingGracias.text}`,
  });

  sendEmail({
    from: `${name.trim()} <no-reply@esantini.com>`,
    subject: 'Felicitaciones!',
    text: `De: ${name} <br />${email ? `Email: ${email}<br />` : ''}<br /> ${message.replace(/(?:\r\n|\r|\n)/g, '<br />')}`,
    to: ['esantinie@gmail.com', 'ana.tamaurab@gmail.com'],
  });
}
