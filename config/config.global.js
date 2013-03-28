var config = module.exports = {};

config.env = {};
config.env.port = process.env.PORT || 3000;
config.env.ipaddress = '0.0.0.0';
// used to generate 'back' urls in emails, 
// helps solving issues with load balancers and proxies
config.hostname = 'http://localhost:3000';

// simple invitation code
config.invitation = {};
config.invitation.enabled = false;
config.invitation.code = '123123123';

// data layer
config.data = {};
config.data.provider = 'collabjs.data.mysql';
//config.data.provider = 'collabjs.data.mssql';
// Note: if defined, 'connectionString' value supersedes parameters host/database/user/password
// this allows providing driver-specific connection strings like one the following samples:
//  'Driver={SQL Server Native Client 11.0};Server={.};Database={collabjs};Trusted_Connection={Yes};'
//  'mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700'
config.data.connectionString = null;
config.data.host = 'localhost';
config.data.database = 'collabjs';
config.data.user = '<username>';
config.data.password = '<password>';

// mail settings
config.smtp = {};
config.smtp.enabled = false;
config.smtp.host = '<host>';
config.smtp.user = '<user>';
config.smtp.password = '<password>';
// used for automatic notification purposes
config.smtp.noreply = 'collab.js <noreply@collabjs.org>';

// recaptcha settings
config.recaptcha = {};
config.recaptcha.enabled = false;
config.recaptcha.publicKey = '6LeWatcSAAAAABpe4Xkm1-fKKOnCG3hF0Z_pfwQ1'; // localhost
config.recaptcha.privateKey = '6LeWatcSAAAAAE6MsdnnV6gA8fzSoUmmPHG8ZSLq'; // localhost

// ui settings
config.ui = {};
config.ui.brand = 'collab.js';
config.ui.copyright = '2013 Denys Vuika';

config.ui.sidebar = {
  // custom sidebar categories with number or links per each
	categories: [],
  // links for special 'Administration' category
  // available for users assigned to 'administrator' role
  administration: []
};

config.ui.header = {
	links: [
	{
		text: 'People',
		url: '/people',
    icon: 'icon-group'
	}]
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

//
// header sample
/*
config.ui.header.links = [
{
	text: 'People',
	url: '/people',
	icon: 'icon-group'
}];
*/