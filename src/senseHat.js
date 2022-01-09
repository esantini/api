module.exports = function(app) {
    const senseLeds = require('sense-hat-led');
    const imu = require('node-sense-hat').Imu;
    const IMU = new imu.IMU();

    app.get('/api/weather', (req, res) => {

        IMU.getValue((error, data) => {
        if (error !== null) {
            console.error('Could not read sensor data: ', error);
            return res.json({
            msg: 'Could not read sensor data',
            error,
            });
        }
        console.log(new Date(), ' sending sensor data');
        return res.json(data);
        });
    });

    if (IS_PROD) {
        startShowMessage();
        function startShowMessage() {
            senseLeds.showMessage(` ${message} `, 0.1, [64, 0, 0], startShowMessage);
        }
    }
}