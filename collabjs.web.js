module.exports = function (context) {
  'use strict';

  var passport = require('passport')
    , routes = require('./routes')
    , authenticate = context.auth.ensureAuthenticated;

  context.once('app.init.routes', function (app) {
    app.get('/', routes.index);
    app.get('/login:returnUrl?', routes.get_login);
    app.post('/login:returnUrl?',
      passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
      routes.post_login);
    app.all('/logout', routes.logout);
    app.get('/register', routes.get_register);
    app.post('/register', routes.post_register(context));
    app.get('/account', authenticate, routes.get_account);
    app.post('/account', authenticate, routes.post_account(context));
    app.get('/account/password', authenticate, routes.get_password);
    app.post('/account/password', authenticate, routes.post_password);
    app.get('/people', authenticate, routes.get_people);
    app.get('/people/:account/followers', authenticate, routes.get_followers);
    app.get('/people/:account/following', authenticate, routes.get_following);
    app.get('/people/:account/timeline', authenticate, routes.get_personal_timeline);
    app.get('/mentions', authenticate, routes.get_mentions);
    app.get('/timeline/posts/:postId', authenticate, routes.get_post);
    app.get('/timeline', authenticate, routes.get_timeline);
    app.get('/help/:article?', authenticate, routes.get_help_article(context));
    app.get('/search', authenticate, routes.get_search);
    app.post('/search', authenticate, routes.post_search(context));
  }); // app.init.routes
}; // module.exports