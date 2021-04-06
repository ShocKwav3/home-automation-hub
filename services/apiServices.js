const https = require('https');
const axios = require('axios');
const fs = require('fs');


const apiServiceInstance = (authToken) => axios.create({
    httpsAgent: new https.Agent({
        ca: fs.readFileSync('server.cert'),
        keepAlive: false,
    }),
    baseURL: 'https://localhost:3000/api',
    //headers: {'Authorization': `Basic ${authToken}`},
    timeout: 5000,
    ...(authToken && {headers: {'Authorization': `Basic ${authToken}`}}),
});


module.exports = {
    apiServiceInstance,
}
