//const socket = require('socket.io-client')('http://192.168.0.16:3000');
const possibleEvents = require('../config/socketEvents');
const hostLogger = require('../helpers/logHelpers').hostLogger('MainProcess');


/*function handleSocketEvents(iotAppInstance) {
    Object.keys(possibleEvents).forEach(singleEventKey => {
        socket.on(possibleEvents[singleEventKey].eventName, (socketData) => {
            const data = possibleEvents[singleEventKey].dataFunction();

            iotAppInstance.send({type: possibleEvents[singleEventKey].eventName, data});
        });
    });
}*/

function startDeviceProcess(cluster) {
    const iotAppInstance = cluster.fork();
    hostLogger('Initiated child process... Pid: ', iotAppInstance.process.pid);

    //handleSocketEvents(iotAppInstance);

    iotAppInstance.on('exit', function (code, signal) {
        hostLogger('child process exited with ' + `code ${code} and signal ${signal}`);
    });

    iotAppInstance.on('error', function (error) {
        hostLogger(`child process failed to be started/killed, message: ${error.message}`);
    });
}


module.exports = {
    startDeviceProcess,
}
