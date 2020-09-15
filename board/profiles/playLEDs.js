function playLEDs (five, message, deviceLogger) {
    const led = new five.Led("D7");

    switch(message.type) {
        case 'turnLedOn':
            led.on();
            deviceLogger('Turning LED on');
            break;
        case 'turnLedOff':
            led.off();
            deviceLogger('Turning LED off');
            break;
        default:
            deviceLogger('Unidentfied message type: ', message.type);
            break;
    }
}


module.exports = {
    playLEDs,
}
