module.exports = function (context) {
  'use strict';

  var express = require('express');

  // JS files to be loaded at run time
  context.js([
    '/admin/js/module.js',
    '/admin/js/controllers/AdminSettingsCtrl.js',
    '/admin/js/controllers/Section1Ctrl.js',
    '/admin/js/controllers/Section2Ctrl.js'
  ]);

  // CSS files to be loaded at run time
  context.css([
    '/admin/css/admin.css'
  ]);

  context.once(context.events.initStaticContent, function (app) {
    // assign additional static resource folder
    app.use('/admin', express.static(__dirname + '/public', { maxAge: 86400000}));
  });
};