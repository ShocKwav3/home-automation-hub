const I2cDevice = require('./I2cDevice');


const ADDRESS_MAX17043 = 0x36;
const REGISTER_VCELL = 0x02;
const VCELL_FACTOR = 0.00125;
const REGISTER_SOC = 0x04;
const SOC_FACTOR = 0.0000390526;
const BYTES_TO_READ = 2;

class Max17043 extends I2cDevice {
    constructor(deviceInstnce) {
        super(deviceInstnce, ADDRESS_MAX17043);
    }

    readSOC = (callback) => {
        this.readRegister(REGISTER_SOC, BYTES_TO_READ, SOC_FACTOR, callback);
    }

    readVoltage = (callback) => {
        this.readRegister(REGISTER_VCELL, BYTES_TO_READ, VCELL_FACTOR, callback);
    }
}

module.exports = Max17043;
