const jwt = require('jsonwebtoken');

exports.getIsWhitelisted = (req) => {
  const { token } = req.cookies;
  if (!token) return false;

  const { whitelist } = config.oauth;
  const { email } = jwt.verify(token, config.tokenSecret);

  return whitelist.indexOf(email) !== -1;
}

exports.getIsAdmin = (req) => {
  const { token } = req.cookies;
  if (!token) return false;

  const { admin } = config.oauth;
  const { email } = jwt.verify(token, config.tokenSecret);

  return admin.indexOf(email) !== -1;
}
