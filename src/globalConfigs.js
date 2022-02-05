// These settings have lower priority than those in privateConfig.json
module.exports = {
  default: {
    env: 'dev',
    apiPort: 3001,
    database: 'devDatabase.db',
    domain: 'esantini.com',
  },
  production: {
    env: 'prod',
    apiPort: 3001,
    database: 'myDatabase.db',
    senseHatEnabled: false,
    api_dir: '/home/pi/repos/api',
    page_dir: '/home/pi/repos/eSantini',
    wedding_dir: '/home/pi/repos/wedding'
  }
}
