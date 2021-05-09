function getPreciseValue(value, precision = 2) {
    return parseFloat(value).toPrecision(precision);
}

module.exports = {
    getPreciseValue,
};
