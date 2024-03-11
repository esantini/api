const jwt = require('jsonwebtoken');

// TODO whitelist from DB
exports.getIsWhitelisted = (req) => {
  const { token } = req.cookies;
  if (!token) return false;

  const { whitelist } = config.oauth;
  const { email } = jwt.verify(token, config.tokenSecret);

  return whitelist.indexOf(email) !== -1;
}
