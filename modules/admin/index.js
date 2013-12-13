module.exports = function (context) {
  'use strict';

  var config = context.config
    , authenticate = context.auth.ensureRole('administrator');

  // define path to module-specific 'views' folder
  var __views = __dirname + '/views/';

  // extend menu
  config.ui.menu.links.push({
    icon: 'wrench',
    url: '/admin/sample1',
    text: 'Link 1'
  });

  config.ui.menu.links.push({
    icon: 'envelope',
    url: '/admin/sample2',
    text: 'Link 2'
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