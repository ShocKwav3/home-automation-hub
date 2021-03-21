var five = require("johnny-five");
var Particle = require("particle-io");
var profileMap = require('../config/profileMap');
var { workerLogger } = require('../helpers/logHelpers');


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
    deviceLogger("Device Ready!");
    const hubFunctionality = profileMap[hubProfile];

    process.on('message', function(message) {
        hubFunctionality ? hubFunctionality(five, message, deviceLogger) : deviceLogger('No profiles found for: ', hubProfile);
    });
});

//NOTE: for logs
//export DEBUG='Main:* Worker:*'
