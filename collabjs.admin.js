'use strict';

module.exports = function (app) {
  console.log('Initializing collabjs.admin routes...');

  app.get('/admin/sample1', ensureRole('administrator'), function (req, res) {
    res.render('admin/sample1', { title: 'admin 1' });
  });

  app.get('/admin/sample2', ensureRole('administrator'), function (req, res) {
    res.render('admin/sample2', { title: 'admin 2' });
  });
};

// Middleware

var ensureRole = function (role) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login?returnUrl=' + req.url);
    }
    else if (req.user.roles && req.user.roles.split(',').indexOf(role) >= 0) {
      return next();
    }
    else {
      return res.render('core/403', {
        user: req.user,
        title: 'Forbidden'
      });
    }
  };
};

var requireRole = function (role) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login?returnUrl=' + req.url);
    } else if (req.user.roles && req.user.roles.split(',').indexOf(role) >= 0) {
      return next();
    } else {
      return res.send(403);
    }
  };
};