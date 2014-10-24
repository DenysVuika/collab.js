var config = module.exports = {};
var fs = require('fs');

config.env = {
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
  // used by web sockets and to generate 'back' urls in emails,
  // helps solving issues with load balancers and proxies
  hostname: 'http://localhost:3000',  // Note: this setting is not used for the moment
  avatarServer: 'https://www.gravatar.com'
};

config.server = {
  sessionSecret: 'keyboard cat',  // session secret, SHOULD BE CHANGED IN PRODUCTION
  sessionCleanupTime: 60000,      // one minute
  cookieSecret: 'keyboard cat',   // cookie secret, SHOULD BE CHANGED IN PRODUCTION
  csrf: true,                     // toggle cross-site request forgery protection middleware
  compression: true,              // toggle content compression middleware,
  http: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  // Note: you can leave https switched off in case of using Nginx with SSL configuration
  https: {
    enabled: false,
    port: process.env.PORT || 3000,
    //port: process.env.PORT || 443,
    host: '0.0.0.0',
    options: {
      key: './config/ssl/dev-key.pem',    // SHOULD BE CHANGED IN PRODUCTION
      cert: './config/ssl/dev-cert.pem'   // SHOULD BE CHANGED IN PRODUCTION
    }
  },
  allowUserRegistration: true
};

// data layer
config.data = {
  provider: 'collabjs.data.mysql',
  sessionStore: 'collabjs.session.mysql',
  //provider: 'collabjs.data.mssql',
  // Note: if defined, 'connectionString' value supersedes parameters host/database/user/password
  // this allows providing driver-specific connection strings like one the following samples:
  //  'Driver={SQL Server Native Client 11.0};Server={.};Database={collabjs};Trusted_Connection={Yes};'
  //  'mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700'
  connectionString: null,
  host: 'localhost',
  port: 3306,
  database: 'collabjs',
  user: '[username]',
  password: '[password]'
};

config.client = {
  js: [],   // JavaScript files to be automatically embedded
  css: []   // CSS files to be automatically embedded
};

// ui settings
config.ui = {
  favicon: '/favicon.ico'
};