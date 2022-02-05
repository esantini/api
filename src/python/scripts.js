
const spawn = require("child_process").spawn;

module.exports = {
    datetime: arg1 => spawn('python3', ["./src/python/display_datetime.py", arg1]),
    text: text => spawn('python3', ["./src/python/display_text.py", text]),
    blink: arg1 => spawn('python3', ["./src/python/blink.py", arg1]),
    beep: arg1 => spawn('python3', ["./src/python/beep.py", arg1]),
    notify: arg1 => spawn('python3', ["./src/python/notify.py", arg1]),
    listenButtons: arg1 => spawn('python3', ["./src/python/listen_buttons.py", arg1]),
    setLight: value => spawn('python3', ["./src/python/set_light.py", value]),
    setLcdBacklight: value => spawn('python3', ["./src/python/set_lcd_backlight.py", value]),
    sayHello: value => spawn('python3', ["./src/python/say_hello.py", value]),
    showStats: value => spawn('python3', ["./src/python/display_stats.py", value]),
};
