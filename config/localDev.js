/* config for local development */
const config = {};

config.port = process.env.PORT || '8000';
config.hostname = `localhost:${config.port}`;

module.exports = config;
