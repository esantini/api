const jwt = require('jsonwebtoken');
const { sendEmail } = require('./utils');

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

  const isAdmin = admin.indexOf(email) !== -1;

  if (!isAdmin) {
    console.error(`Unauthorized Access by ${req.ip}`);
    const geo = geoip.lookup(req.ip);
    sendEmail({
      subject: 'Unauthorized Access Attempt',
      text: `
        Unauthorized Access from <b>${req.ip}</b> <br /><br />
        IP Address: <b>${req.ip}</b> <br /><br />
        Timestamp: <b>${new Date().toISOString()}</b> <br /><br />
        Requested URL: <b>${req.originalUrl}</b> <br /><br />
        HTTP Method: <b>${req.method}</b> <br /><br />
        User Agent: <b>${req.headers['user-agent']}</b> <br /><br />
        Request Body: <b>${JSON.stringify(req.body)}</b> <br /><br />
        Referrer: <b>${req.headers['referrer']}</b> <br /><br />
        Request Headers: <b>${JSON.stringify(req.headers)}</b> <br /><br />
        Geo: <b>${JSON.stringify(geo)}</b>
    ` });
  }

  return isAdmin;
}
