var config = require('../../config')
  , mysql = require('mysql');

// create database connection pool based on configuration settings
module.exports.pool = mysql.createPool(config.data.connectionString || {
  host: config.data.host,
  port: config.data.port,
  database: config.data.database,
  user: config.data.user,
  password: config.data.password
});