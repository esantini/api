
const spawn = require("child_process").spawn;

module.exports = {
    datetime: () => spawn('python', ["./src/python/display_datetime.py"]),
    text: text => spawn('python', ["./src/python/display_text.py", text]),
    blink: () => spawn('python', ["./src/python/blink.py"]),
    beep: () => spawn('python', ["./src/python/beep.py"]),
    notify: () => spawn('python', ["./src/python/notify.py"]),
    listenButton: () => spawn('python', ["./src/python/listen_button_1.py"]),
};
