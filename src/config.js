module.exports = {
  default: {
    env: 'dev',
    apiPort: 3003,
    database: 'devDatabase.db'
  },
  production: {
    env: 'prod',
    apiPort: 3001,
    database: 'myDatabase.db',
    senseHatEnabled: true,
    api_dir: '/home/pi/repos/api',
    page_dir: '/home/pi/repos/eSantini',
    wedding_dir: '/home/pi/repos/wedding'
  }
}
