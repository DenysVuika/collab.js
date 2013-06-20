var config = module.exports = {};

config.env = {
  port: process.env.PORT || 3000,
  ipaddress: '0.0.0.0',
  // used by web sockets and to generate 'back' urls in emails,
  // helps solving issues with load balancers and proxies
  hostname: 'http://localhost:3000'
};

// simple invitation code
config.invitation = {
  enabled: false,
  code: '123123123'
};

// data layer
config.data = {
  provider: 'collabjs.data.mysql',
  //provider: 'collabjs.data.mssql',
  // Note: if defined, 'connectionString' value supersedes parameters host/database/user/password
  // this allows providing driver-specific connection strings like one the following samples:
  //  'Driver={SQL Server Native Client 11.0};Server={.};Database={collabjs};Trusted_Connection={Yes};'
  //  'mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700'
  connectionString: null,
  host: 'localhost',
  database: 'collabjs',
  user: '[username]',
  password: '[password]'
};

// mail settings
config.smtp = {
  enabled: false,
  host: '[host]',
  user: '[user]',
  password: '[password]',
  // used for automatic notification purposes
  noreply: 'collab.js <noreply@collabjs.org>'
};

// recaptcha settings
config.recaptcha = {
  enabled: false,
  publicKey: '6LeWatcSAAAAABpe4Xkm1-fKKOnCG3hF0Z_pfwQ1', // localhost
  privateKey: '6LeWatcSAAAAAE6MsdnnV6gA8fzSoUmmPHG8ZSLq'
};

// ui settings
config.ui = {
  brand: 'collab.js',
  copyright: '2013 Denys Vuika',
  header: {
    links: [
      {
        text: 'People',
        url: '/people',
        icon: 'icon-group'
      }]
  },
  sidebar: {
    // custom sidebar categories with number or links per each
    categories: [],
    // links for special 'Administration' category
    // available for users assigned to 'administrator' role
    administration: []
  }
};

//
// sidebar sample
/*
config.ui.sidebar.categories = [
{
	name: 'Libraries',
	entries: [
	{
		text: 'Library 1',
		icon: 'icon-th-large',
		url: '/libraries/lib01'
	},
	{
		text: 'Library 2',
		icon: 'icon-th-large',
		url: '/libraries/lib02'
	}]
}];
*/

/**
 * Administration category example
 */
/*
config.ui.sidebar.administration = [
  {
    text: 'Link 1',
    icon: 'icon-wrench',
    url: '/admin/sample1'
  },
  {
    text: 'Link 2',
    icon: 'icon-wrench',
    url: '/admin/sample2'
  }
];
*/