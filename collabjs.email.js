var config = require('./config')
	,	nodemailer = require('nodemailer');

var transport = nodemailer.createTransport('SMTP', {
  host: config.smtp.host,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password
  }
});

module.exports.sendMail = transport.sendMail;