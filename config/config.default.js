var config = require('./config.global');

// data
config.data.provider = 'collabjs.data.mysql';
config.data.host = 'localhost';
config.data.database = 'collabjs';
config.data.user = '<user>';
config.data.password = '<password>';

// smtp
config.smtp.enabled = false;
config.smtp.host = '<host>';
config.smtp.user = '<user>';
config.smtp.password = '<password>';

module.exports = config;