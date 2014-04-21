module.exports = function (context) {
  'use strict';

  context.once(context.events.initWebRoutes, function (app) {

    app.get('/', function (req, res) {
      res.render('index', {
        title: 'collab.js',
        user: req.user
      });
    });
  });
};