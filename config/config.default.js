var config = require('./config.global');

// OVERRIDE GLOBAL SETTINGS HERE

//
// SAMPLE #1: Local database
//
/*
config.data.provider = 'collabjs.data.mysql';
config.data.sessionStore = 'collabjs.session.mysql';
config.data.host = 'localhost';
config.data.database = 'collabjs';
config.data.user = '<user>';
config.data.password = '<password>';
*/

//
// SAMPLE #2: Red Hat OpenShift Configuration (with MySQL cartridge)
//
/*
config.env.ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
config.env.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
config.data.provider = 'collabjs.data.mysql';
config.data.sessionStore = 'collabjs.session.mysql';
config.data.host = process.env.OPENSHIFT_MYSQL_DB_HOST;
config.data.database = 'collabjs';
config.data.user = process.env.OPENSHIFT_MYSQL_DB_USERNAME;
config.data.password = process.env.OPENSHIFT_MYSQL_DB_PASSWORD;
*/

module.exports = config;