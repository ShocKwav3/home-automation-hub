const apiConfig = {
    development: {
        baseUrl: 'https://localhost',
        port: 3000,
    },
    production: {
        baseUrl: 'https://someprodurl',
        port: 3000,
    },
};

function getApiBaseUrl (version, configContext) {
    return `${apiConfig[configContext].baseUrl}:${apiConfig[configContext].port}/api/${version}`;
}

module.exports = {
    getApiBaseUrl,
};
