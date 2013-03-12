var env = process.env.NODE_CFG || 'default'
	, cfg = require('./config.' + env);

module.exports = cfg;