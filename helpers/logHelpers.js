const chalk = require('chalk');


const boxenMessage = (message) => require('boxen')(message, {
    borderStyle: 'round',
    dimBorder: true,
    margin: {
        left: 2,
    },
});
const timeNow = new Date().toISOString();
const logger = console.log;
const hostLogger = (identifier) => require('debug')(`Main:${identifier} [${timeNow}]`);
const workerLogger = (deviceId) => require('debug')(`Worker:${deviceId} [${timeNow}]`);
const getProgramLogger = (context) => {
    const programLogger = require('debug')(`Program:${context}`)

    return (message, box) => {
        if (!box) {
            return programLogger(message);
        }

        programLogger(' ');
        logger(boxenMessage(message));
    }
}

const genericPending = (message) => chalk.blue.underline(message);
const genericError = (message) => chalk.bgRed.bold(message);
const genericSuccess = (message) => chalk.green(message);
const genericFailure = (message) => chalk.bgYellow.black(message)
const genericWarning = (message) => chalk.yellow.italic(message);
const basicText = (text) => chalk.white(text);
const values = (valuesToApplyStyle) => chalk.magentaBright(valuesToApplyStyle);
const logStylers = {
    genericPending,
    genericError,
    genericSuccess,
    genericFailure,
    genericWarning,
    basicText,
    values,
};


module.exports = {
    logStylers,
    logger,
    hostLogger,
    workerLogger,
    getProgramLogger,
};
