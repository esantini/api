const crypto = require('crypto');

const validateJsonWebhook = (request) => {
  // calculate the signature
  const expectedSignature =
    'sha1=' +
    crypto
      .createHmac('sha1', config.api_key)
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
