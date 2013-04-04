#!/bin/env node
// for more details on the command above please refer to the following resource:
// http://stackoverflow.com/questions/15061001/what-do-bin-env-mean-in-node-js

'use strict';

/**
 * Module dependencies.
 */

var express = require('express')
  , flash = require('connect-flash')
  , fs = require('fs')
  , routes = require('./routes')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , passwordHash = require('password-hash')
  , db = require('./data')
  , config = require('./config')
  , auth = require('./collabjs.auth')
  , utils = require('./collabjs.utils');

/*
 * Authentication Layer
*/

// Password session setup.
//    To support persistent Login sessions, Passport needs to be able to
//    serialize users into and deserialize users out of the session. Typically
//    this will be as simple as storing the user ID when serializing, and finding
//    the user by ID when deserializing.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  db.getAccountById(id, function (err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport.
//    Strategies in passport require a 'verify' function, which accepts
//    credentials (in this case, a username and password), and invokes a callback
//    with a user object. 
passport.use(new LocalStrategy(
  function(username, password, done) {
    // async verification, for effect...
    process.nextTick( function(){
      // Find the user by username. If there is no user with the given
      // username, or the password is not correct, set the user to 'false' to
      // indicate failure and set a flash message. Otherwise, return the 
      // authenticated 'user'.
      db.getAccount(username, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (!passwordHash.verify(password, user.password)) {
          return done(null, false, { message: 'Invalid password' });
        }
        return done(null, user);
      });
    });
  }
));

// Create server
var app = express();

// Configuration
app.configure(function () {
  app.set('port', config.env.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use(express.favicon());
  app.use(express.favicon(__dirname + '/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  // app.use(express.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }));
  app.use(express.session({ secret: 'keyboard cat'}));
  app.use(express.csrf());
  // Initialize Passport! Also use passport.session() middleware, to support
  // persistent Login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  // Use connect-flash middleware. This will add a 'req.flash()' function to
  // all requests, matching the functionality offered in Express 2.x.
  app.use(flash());

  // Initialize variables that are provided to all templates rendered within the application
  app.locals.config = config;
  //app.locals.isUserInRole = auth.isUserInRole;
  app.use(function (req, res, next) {
    res.locals.token = req.session._csrf;
    res.locals.user = req.user;
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.isAdministrator = auth.isUserInRole(req.user, 'administrator');
    next();
  });
  app.use(utils.detectMobileBrowser);
  app.use(app.router);
  app.use(express.static(__dirname + '/public', { maxAge: 86400000})); // one day
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

require('./collabjs.web.js')(app);
require('./collabjs.web.api.js')(app);
require('./collabjs.admin.js')(app);

app.listen(config.env.port, config.env.ipaddress);
console.log("Express server listening on port %d in %s mode", config.env.port, app.settings.env);