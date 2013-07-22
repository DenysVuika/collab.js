'use strict';

var passport = require('passport')
  , routes = require('./routes');

module.exports = function (context) {

  var ensureAuthenticated = context.auth.ensureAuthenticated;

  context.once('app.init.routes', function (app) {
    app.get('/', routes.index);
    app.get('/login:returnUrl?', routes.get_login);
    app.post('/login:returnUrl?',
      passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
      routes.post_login);
    app.all('/logout', routes.logout);
    app.get('/register', routes.get_register);
    app.post('/register', routes.post_register(context));
    app.get('/account', ensureAuthenticated, routes.get_account);
    app.post('/account', ensureAuthenticated, routes.post_account(context));
    app.get('/account/password', ensureAuthenticated, routes.get_password);
    app.post('/account/password', ensureAuthenticated, routes.post_password);
    app.get('/people/:account/follow', ensureAuthenticated, routes.follow(context));
    app.get('/people/:account/unfollow', ensureAuthenticated, routes.unfollow(context));
    app.get('/people', ensureAuthenticated, routes.get_people);
    app.get('/people/:account/followers', ensureAuthenticated, routes.get_followers(context));
    app.get('/people/:account/following', ensureAuthenticated, routes.get_following(context));
    app.get('/people/:account/timeline', ensureAuthenticated, routes.get_personal_timeline(context));
    app.get('/mentions', ensureAuthenticated, routes.get_mentions);
    app.get('/timeline/posts/:postId', ensureAuthenticated, routes.get_post);
    app.get('/timeline', ensureAuthenticated, routes.get_timeline);
    app.get('/help/:article?', ensureAuthenticated, routes.get_help_article);
    app.get('/search', ensureAuthenticated, routes.get_search);
    app.post('/search', ensureAuthenticated, routes.post_search);
  }); // app.init.routes
}; // module.exports