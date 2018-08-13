const osHostname = require('os').hostname();

const logger = require('../lib/logger')('CONFIG');
const { version } = require('../package.json');

const domain = 'example.com';
const branch = process.env.APP_BRANCH
  ? process.env.APP_BRANCH.trim()
  : 'localDev';

function load() {
  logger.log(`Loading configuration for ${branch}`);
  logger.log(`ENV: \n ${JSON.stringify(process.env)}\n\n`);

  let config;
  if (branch === 'localDev') {
    logger.error('Branch is localDev');
    config = require('./localDev'); // eslint-disable-line global-require
  } else {
    config = build();
  }

  config.version = version;
  config.osHostname = osHostname;

  // log the configuration
  Object.keys(config).forEach((key) => {
    logger.log(`${key} == ${JSON.stringify(config[key])}`);
  });

  return config;
}

function build() {
  const config = {};

  if (process.env.APP_HOST) {
    config.host = process.env.APP_HOST.trim();
  } else {
    config.host = (branch === 'prod') ? 'app' : branch.toLowerCase();
  }

  config.domain = domain;
  config.hostname = `${config.host}.${domain}`;
  config.port = process.env.APP_PORT || '8000';

  return config;
}

module.exports = load();
