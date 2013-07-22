/* global describe, it */
'use strict';

var express = require('express')
  , request = require('supertest')
  , should = require('should')
  , runtime = require('../collabjs.runtime')
  , RuntimeEvents = runtime.RuntimeEvents;

describe('collab.js web', function () {

  var app = express()
    , context = new runtime.RuntimeContext()
    , web = require('../collabjs.web')(context);

  // user to authenticate requests
  var testUser = {
    id: 1,
    account: 'dvuyka',
    name: 'Denis Vuyka',
    pictureId: '00000000000000000000000000000000'
  };

  app.set('views', __dirname + '/fixtures');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  // make application always authenticated for test purposes
  app.use(function (req, res, next) {
    req.user = testUser;
    req.isAuthenticated = function() { return true; };
    next();
  });
  // emulate `connect-flash` middleware
  app.use(function (req, res, next) {
    req.flash = function (errType, errMessage) {
      if (errMessage) {
        return errMessage;
      } else {
        return errType;
      }
    };
    next();
  });

  // raise 'app.init.routes' event for web.api to initialize routes
  context.emit(RuntimeEvents.app_init_routes, app);

  describe('login', function (done) {

    it('renders login form', function (done) {
      request(app)
        .get('/login')
        .expect('<div>Login</div>', done);
    });
  });
});