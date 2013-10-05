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
  , utils = require('./collabjs.utils')
  , runtime = require('./collabjs.runtime')
  , RuntimeEvents = runtime.RuntimeEvents
  , runtimeContext = new runtime.RuntimeContext()
  , http = require('http');

// Create server

var app = express()
  , sessionStore = new db.SessionStore()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , passportSocketIo = require('passport.socketio');

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

// Load external modules
require('./modules')(runtimeContext);

// Configuration

app.enable('trust proxy');
app.set('port', config.env.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// use content compression middleware if enabled
if (config.server.compression) {
  app.use(express.compress());
}

app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public', { maxAge: 86400000})); // one day
runtimeContext.emit(RuntimeEvents.app_init_static, app);

//app.use(express.favicon());
app.use(express.favicon(__dirname + '/favicon.ico'));
app.use(express.cookieParser(config.server.cookieSecret));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({
  secret: config.server.sessionSecret,
  cookie: { maxAge: 14 * 24 * 3600 * 1000 }, // 2 weeks
  store: sessionStore }));

// use CSRF protection middleware if enabled
if (config.server.csrf) {
  app.use(express.csrf());
}

// Initialize Passport! Also use passport.session() middleware, to support
// persistent Login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// Use connect-flash middleware. This will add a 'req.flash()' function to
// all requests, matching the functionality offered in Express 2.x.
app.use(flash());

// Custom middleware

app.use(utils.commonLocals);
app.use(utils.savedSearches);
app.use(utils.detectMobileBrowser);

// Router

app.use(app.router);

// Socket.io authorization

io.set('authorization', passportSocketIo.authorize({
  cookieParser: express.cookieParser, // or connect.cookieParser
  secret: config.server.sessionSecret,
  store: sessionStore,
  fail: function (data, accept) {
    accept(null, false);
  },
  success: function (data, accept) {
    accept(null, true);
  }
}));

/*
 io.sockets.on('connection', function (socket) {
 console.log('user connected: ', socket.handshake.user);
 });
*/

// Default routes

require('./collabjs.web.js')(runtimeContext);
require('./collabjs.web.api.js')(runtimeContext);

// Notify external modules that their routes need to be initialized
runtimeContext.emit(RuntimeEvents.app_init_routes, app);

// Error handling

/*
// Default error handlers for development/production modes
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});
*/

// Since this is the last non-error-handling middleware used,
// we assume 404, as nothing else responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"
app.use(function (req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('core/404', {
      title: 'Not found',
      url: req.url
    });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text
  res.type('text').send('Not found');
});

// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

app.use(function(err, req, res, next){
  var env = process.env.NODE_ENV || 'development';
  if (env === 'development') { console.error(err.stack); }
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.status(err.status || 500);
  res.render('core/500', { error: err });
});

app.get('/404', function (req, res, next) {
  // trigger a 404 since no other middleware
  // will match /404 after this one, and we're not
  // responding here
  next();
});

app.get('/403', function (req, res, next) {
  // trigger a 403 error
  var err = new Error('not allowed!');
  err.status = 403;
  next(err);
});

app.get('/500', function(req, res, next){
  // trigger a generic (500) error
  next(new Error('keyboard cat!'));
});



// Server startup

// Notify external modules that application is about to start
runtimeContext.emit(RuntimeEvents.app_start, app);
server.listen(config.env.port, config.env.ipaddress);
console.log("collab.js server listening on port %d in %s mode", config.env.port, app.settings.env);