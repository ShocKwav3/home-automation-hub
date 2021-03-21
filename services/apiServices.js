const axios = require('axios');


const apiServiceInstance = (authToken) => axios.create({
    baseURL: 'http://localhost:3000/api',
    //headers: {'Authorization': `Basic ${authToken}`},
    timeout: 5000,
    ...(authToken && {headers: {'Authorization': `Basic ${authToken}`}}),
});


module.exports = {
    apiServiceInstance,
}
