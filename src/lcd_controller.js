const pythons = require('./python');

let lcdProcess = pythons.sayHello();

let backlight = true;

const toggleBacklight = () => {
  if (backlight) {
    if (lcdProcess) {
      lcdProcess.kill('SIGTERM');
      lcdProcess = null;
    }
  }
  pythons.setLcdBacklight(!backlight)
  backlight = !backlight;
  if (backlight) {
    lcdProcess = pythons.showStats();
  }
}
let backlightDebouncer = true;
const backlightButton = () => {
  if (backlightDebouncer) {
    toggleBacklight();
    backlightDebouncer = false;
    setTimeout(() => backlightDebouncer = true, 1000);
  }
}

setTimeout(() => {
  lcdProcess = pythons.showStats();
  
  pythons.listenButtons().stdout.on('data', (data) => {
  
    switch (data.toString().trim()) {
      case 'backlight':
        backlightButton();
        break;
      case 'enter':
        console.log('enter');
        break;
      case 'select':
        console.log('select');
        break;
    
      default:
        break;
    }
    // if (notifProcess) {
    //   notifProcess.kill('SIGTERM');
    //   notifProcess = null;
    // }
  });
}, 3000);

// let notifProcess;
// const notify = () => {
//   if (notifProcess) {
//     pythons.beep();
//   }
//   else {
//     notifProcess = pythons.notify();
//   }
// }


exports.showMessage = msg => console.log(`showing message: ${msg}`);

// exports.notify = notify;
