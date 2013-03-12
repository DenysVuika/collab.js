var config = require('./config.global');

// TODO: override global settings here

// configure data provider
config.data.provider = 'collabjs.data.mysql';
config.data.host = 'localhost';
config.data.database = 'collabjs';
config.data.user = '<user>';
config.data.password = '<password>';

module.exports = config;