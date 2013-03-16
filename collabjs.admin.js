'use strict';

// import middleware
var auth = require('./collabjs.auth')
  , ensureRole = auth.ensureRole;

module.exports = function (app) {
  console.log('Initializing collabjs.admin routes...');

  app.get('/admin/sample1', ensureRole('administrator'), function (req, res) {
    res.render('admin/sample1', { title: 'admin 1' });
  });

  app.get('/admin/sample2', ensureRole('administrator'), function (req, res) {
    res.render('admin/sample2', { title: 'admin 2' });
  });
};