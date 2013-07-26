module.exports = function (context) {
  'use strict';

  var config = context.config
    , authenticate = context.auth.ensureRole('administrator');

  // define path to module-specific 'views' folder
  var __views = __dirname + '/views/';

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

  // add custom routes
  context.once('app.init.routes', function (app) {
    app.get('/admin/sample1', authenticate, function (req, res) {
      res.render(__views + 'sample1', { title: 'admin 1' });
    });

    app.get('/admin/sample2', authenticate, function (req, res) {
      res.render(__views + 'sample2', { title: 'admin 2' });
    });
  });
};