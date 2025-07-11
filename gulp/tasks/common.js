import fs from 'fs';

function getDataFilePath(filename) {
  return `./src/data/${filename}`;
}

function getData(filename) {
  return JSON.parse(fs.readFileSync(getDataFilePath(filename), 'utf-8'));
}

function getConfig(configFile) {
  return JSON.parse(fs.readFileSync(`./gulp/${configFile}`, 'utf-8'));
}

function getNodeEnvironment() {
  return process.env.NODE_ENV || 'development';
}

function isProd() {
  return getNodeEnvironment() === 'production';
}

export {
  getData,
  getConfig,
  getNodeEnvironment,
  isProd
};