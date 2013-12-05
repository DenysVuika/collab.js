module.exports = function (context) {
  'use strict';

  var passport = require('passport')
    , routes = require('./routes')
    , authenticate = context.auth.ensureAuthenticated;

  context.once('app.init.routes', function (app) {
    app.get('/', routes.index);

    app.get('/partials/:name', function (req, res) {
      var name = req.params.name;
      res.render('core/partials/' + name, {});
    });

    app.get('/login:returnUrl?', routes.get_login);
    app.post('/login:returnUrl?',
      passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
      routes.post_login);
    app.all('/logout', routes.logout);
    app.get('/register', routes.get_register);
    app.post('/register', routes.post_register(context));
  }); // app.init.routes
}; // module.exports