const pythons = require('../python');

let isLightOn = false;
exports.setLight = (value, isVerbose = true) => {
  // toggle if there is no value

  isLightOn = value === undefined ? !isLightOn : value;

  if (isVerbose) console.log(`Turning Light: ${isLightOn ? 'ON' : 'OFF'}`);

  pythons.setLight(isLightOn).stdout.on('data', (data) => {
    // if (isVerbose) console.log({ data });
  });
}
exports.getLight = () => isLightOn;
