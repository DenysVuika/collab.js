module.exports = function (context) {
  'use strict';

  var express = require('express');

  // JS files to be injected at run time
  context.js([
    '/admin/js/module.js',
    '/admin/js/controllers/AdminSettingsCtrl.js'
  ]);

  context.once(context.events.initStaticContent, function (app) {
    // assign additional static resource folder
    app.use('/admin', express.static(__dirname + '/public', { maxAge: 86400000}));
  });
};