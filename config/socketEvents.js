const {
    getDataForLedOnEvent,
    getDataForLedOffEvent,
} = require('../helpers/socketEventHelpers/ledEventHelpers');


module.exports = {
    turnOnLed: {
        eventName: 'turnLedOn',
        dataFunction: getDataForLedOnEvent,
    },
    turnOffLed: {
        eventName: 'turnLedOff',
        dataFunction: getDataForLedOffEvent,
    },
}
