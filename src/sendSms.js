let client;
if (config.smsEnabled) {
  client = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
}

module.exports = message => config.smsEnabled ? client.messages
  .create({
     body: `New Message: ${message} . From eSantini.com`,
     from: config.twilio.fromNumber,
     to: config.twilio.phoneNumber
   })
  .then(message => console.log(`Sent SMS: ${message.sid}`))
  .catch(err => console.log({err})) :
  console.log('"Sending" SMS');
