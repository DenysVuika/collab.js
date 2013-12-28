module.exports = function (context) {
  'use strict';

  var config = context.config;

  context.once('app.init.routes', function (app) {

    app.get('/', function (req, res) {
      res.render('core/index', {
        title: config.ui.brand,
        user: req.user
      });
    });

    app.get('/partials/:name', function (req, res) {
      var name = req.params.name;
      res.render('core/partials/' + name, {});
    });
  });
};