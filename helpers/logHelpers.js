const timeNow = new Date().toISOString();
const hostLogger = (identifier) => require('debug')(`Main:${identifier} [${timeNow}]`);
const workerLogger = (deviceId) => require('debug')(`Worker:${deviceId} [${timeNow}]`)


module.exports = {
    hostLogger,
    workerLogger,
}
