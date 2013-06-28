'use strict';

var config = require('../config')
  , auth = require('../collabjs.auth')
  , ensureRole = auth.ensureRole;

// define path to module-specific 'views' folder
var __views = __dirname + '/admin/views/';

// extend sidebar
config.ui.sidebar.administration.push({
  text: 'Link 1',
  icon: 'icon-wrench',
  url: '/admin/sample1'
});
config.ui.sidebar.administration.push({
  text: 'Link 2',
  icon: 'icon-wrench',
  url: '/admin/sample2'
});

module.exports = function (context) {
  console.log('collab.js: initializing admin module...');
  var app = context.app;

  app.get('/admin/sample1', ensureRole('administrator'), function (req, res) {
    res.render(__views + 'sample1', { title: 'admin 1' });
  });

  app.get('/admin/sample2', ensureRole('administrator'), function (req, res) {
    res.render(__views + 'sample2', { title: 'admin 2' });
  });
};