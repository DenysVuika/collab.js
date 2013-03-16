'use strict';

var config = require('../config');
/*
 * GET home page.
 */

exports.index = function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/timeline');
  } else {
    res.render('core/index', {
      title: config.ui.brand,
      user: req.user
    });
  }
};