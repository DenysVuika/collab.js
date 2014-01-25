module.exports = function (context) {
  'use strict';

  var express = require('express');

  var config = context.config
    , authenticate = context.auth.ensureRole('administrator');

  // JS files to be included into layout
  config.client.js.push('/admin/public/js/module.js');

  context.once('app.init.static', function (app) {
    // assign additional static resource folder
    app.use('/admin/public', express.static(__dirname + '/public', { maxAge: 86400000}));
  });

  // define path to module-specific 'views' folder
  // var __views = __dirname + '/views/';

  // add custom routes
  /*
  context.once('app.init.routes', function (app) {
    app.get('/admin/sample1', authenticate, function (req, res) {
      res.render(__views + 'sample1', { title: 'admin 1' });
    });

    app.get('/admin/sample2', authenticate, function (req, res) {
      res.render(__views + 'sample2', { title: 'admin 2' });
    });
  });
  */
};