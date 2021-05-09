const { getPreciseValue } = require('../utils');


function getBinaryValue(array) {
    const MSB = array[0] << 4;
    const LSB = array[1] >> 4;

    return MSB | LSB;
}

class I2cRead {
    constructor (deviceInstance, i2cDeviceAddress) {
        this.device = deviceInstance;
        this.address = i2cDeviceAddress;
    }

    readRegister = (registerAddress, bytesToRead, factor, callback) => {
        this.device.i2cConfig();
        this.device.i2cRead(this.address, registerAddress, bytesToRead, (data) => {
            const binaryValue = getBinaryValue(data)
            const registerValue = getPreciseValue(binaryValue * factor, 3);

            console.log(`Register value: ${registerValue}`)

            //callback(registerValue);
        });
    }
}

module.exports = I2cRead;
