const https = require('https');
const axios = require('axios');
const fs = require('fs');

const apiConfig = require('../config/apiConfig');


const getApiServiceInstance = (version, authToken) => axios.create({
    baseURL: apiConfig.getApiBaseUrl(version, process.env.NODE_ENV),
    timeout: 5000,
    ...(authToken && {headers: {'Authorization': `Basic ${authToken}`}}),
    validateStatus: function (statusCode) {
        return statusCode >= 200 && statusCode < 400;
    },
    httpsAgent: new https.Agent({
        ca: fs.readFileSync('server.cert'),
        keepAlive: false,
    }),
});


module.exports = {
    getApiServiceInstance,
}
