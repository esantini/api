const { addMessage } = require('../apollo/database');
const lcd = require('./lcd_controller');
const { sendEmail } = require('./emailUtils');

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
      subject: 'e-Santini Message',
      text: `<h2>New Message!</h2> ${message}`,
    });
  }
}
