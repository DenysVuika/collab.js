var config = require('../config');
/*
 * GET home page.
 */

exports.index = function (req, res) {
  if (req.isAuthenticated()) {
  	res.redirect('/timeline');
  } else {
  	res.render('core/index', {
  		settings: config.ui,
  		title: config.ui.brand,
  		user: req.user
  	});
  }
};