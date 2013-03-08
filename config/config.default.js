var config = require('./config.global');

// enable invitation
config.invitation.enabled = true;
config.invitation.code = '123123123';

// configure data provider
config.data.provider = 'collabjs.data.mysql';
config.data.host = 'localhost';
config.data.database = 'collabjs';
config.data.user = '<user>';
config.data.password = '<password>';

// configure smtp
config.smtp.enabled = false;
config.smtp.host = '<host>';
config.smtp.user = '<user>';
config.smtp.password = '<password>';

module.exports = config;