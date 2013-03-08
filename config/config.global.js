var config = module.exports = {};

config.env = {};
config.env.port = process.env.PORT || 3000;
config.env.ipaddress = '127.0.0.1';
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
// config.recaptcha.enabled = true; // not implemented yet
config.recaptcha.publicKey = '6LeWatcSAAAAABpe4Xkm1-fKKOnCG3hF0Z_pfwQ1'; // localhost
config.recaptcha.privateKey = '6LeWatcSAAAAAE6MsdnnV6gA8fzSoUmmPHG8ZSLq'; // localhost

// ui settings
config.ui = {};
config.ui.brand = 'collab.js';
config.ui.copyright = '2013 Denys Vuika';

config.ui.sidebar = {
	categories: []
};

config.ui.header = {
	links: [
	{
		text: 'People',
		url: '/people'
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


//
// header sample
/*
config.ui.header.links = [
{
	text: 'People',
	url: '/people'
}];
*/