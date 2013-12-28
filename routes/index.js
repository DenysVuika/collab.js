// TODO: no longer used
'use strict';

var config = require('../config');

exports.index = function (req, res) {
  res.render('core/index', {
    title: config.ui.brand,
    user: req.user
  });
};

// POST: /login:returnUrl?
/*exports.post_login = function (req, res) {
  // save account for future reuse
  // (typically it will be used only to fill Login form)
  res.cookie('account', req.user.account, { maxAge: 900000, httpOnly: true, path: '/login', signed: true });
  // redirect if return url is provided
  var returnUrl = req.query.returnUrl;
  if (returnUrl && utils.isUrlLocalToHost(returnUrl)) {
    res.redirect(returnUrl);
  } else {
    res.redirect('/');
  }
};*/