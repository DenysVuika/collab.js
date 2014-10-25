var config = module.exports = {};

config.env = {
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
  avatarServer: 'https://www.gravatar.com'
};

config.server = {
  session: {
    databaseStore: false,                             /* enable database store, by default uses cookie sessions (recommended) */
    secret: '{4766B0F9-6B34-4065-B06A-C87B1D027E02}', /* session secret, SHOULD BE CHANGED IN PRODUCTION */
    duration: 14 * 24 * 3600 * 1000,                  /* 2 weeks */
    activeDuration: 1000 * 60 * 60,                   /* 1 hour */
    secureProxy: false                                /* requires SSL proxy, enable when running under HTTP */
  },
  csrf: true,                     // toggle cross-site request forgery protection middleware
  compression: true,              // toggle content compression middleware,
  allowUserRegistration: true     // toggle self-registration for users
};

// data layer, supported db engines: MySQL
config.data = {
  provider: 'collabjs.data.mysql',
  sessionStore: 'collabjs.session.mysql', /* used only if config.server.session.databaseStore = true */
  sessionCleanupTime: 60000,              /* 1 minute */
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