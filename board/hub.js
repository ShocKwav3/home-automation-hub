var five = require("johnny-five");
var Particle = require("particle-io");
var profileMap = require('../config/profileMap');
var { workerLogger } = require('../helpers/logHelpers');
var Max17043 = require('../helpers/electronicsHelpers/Max17043');


const deviceId = process.argv.slice(2)[0];
const token = process.argv.slice(2)[1]; //FIXME: encryption needed
const hubProfile = process.argv.slice(2)[2];
const deviceLogger = workerLogger(deviceId);

var board = new five.Board({
    repl: false,
    io: new Particle({
        deviceId,
        token,
    }),
});

board.on("ready", function () {
    deviceLogger(`Device ready, running child process (pid: ${process.pid}) under host process (pid: ${process.ppid})`);
    const hubFunctionality = profileMap[hubProfile];

    /*process.on('message', function(message) {
        hubFunctionality ? hubFunctionality(five, message, deviceLogger) : deviceLogger('No profiles found for: ', hubProfile);
    });*/

    /*var led = new five.Led("D7");
    led.blink();*/

    const BatteryMonitor = new Max17043(this);
    deviceLogger('SOC: ', BatteryMonitor.readSOC());
    deviceLogger('Voltage: ', BatteryMonitor.readVoltage());

});

//NOTE: for logs
//export DEBUG='Main:* Worker:*'
