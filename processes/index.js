const cluster = require('cluster');
const { startDeviceProcess } = require('./deviceProcess.js');
const path = require('path');
const hostLogger = require('../helpers/logHelpers').hostLogger('MainProcess');


function startHostProcess () {
    hostLogger('Initiating host process... Pid: ', process.pid);

    cluster.setupMaster({
        exec: path.resolve(__dirname, '..', 'board/hub.js'),
        args: ['33005c000e504b464d323520', '9d1c1d4ee5ccef63f285e5fac87ef31692d3bb6b', 'playLEDs'],
    });

    startDeviceProcess(cluster);
}

startHostProcess();

//receive settings via process send and run mapper function based on that
