'use strict';

var express = require('express')
  , request = require('supertest')
  , auth = require('../../collabjs.auth.js')
  , expect = require('expect.js');

describe('collabjs.auth', function () {

  var app;

  beforeEach(function () {
    app = express();

    app.set('views', __dirname + '/fixtures');
    app.set('view engine', 'jade');
  });

  var authReject = function (req, res, next) {
    req.isAuthenticated = function() { return false; };
    next();
  };

  var authAccept = function (req, res, next) {
    req.isAuthenticated = function() { return true; };
    req.user = {};
    next();
  };

  var authAcceptWithRoles = function (roles) {
    return function (req, res, next) {
      req.isAuthenticated = function () { return true; };
      req.user = { roles: roles };
      next();
    };
  };

  describe('.ensureAuthenticated', function () {
    it('should redirect to login page', function (done) {

      app.use(authReject);
      app.use(auth.ensureAuthenticated);

      request(app)
        .get('/timeline')
        .expect(302)
        .end(function (err, res) {
          expect(res.headers.location).to.be('/login?returnUrl=/timeline');
          done();
        });
    });

    it('should allow access', function (done) {

      app.use(authAccept);
      app.use(auth.ensureAuthenticated);
      app.get('/timeline', function (req, res) { res.send(200); });

      request(app)
        .get('/timeline')
        .expect(200, done);
    });
  });

  describe('.requireAuthenticated', function() {
    it('should forbid access', function (done) {

      app.use(authReject);
      app.use(auth.requireAuthenticated);

      request(app)
        .get('/timeline')
        .expect(401, done);
    });

    it('should allow access', function (done) {

      app.use(authAccept);
      app.use(auth.requireAuthenticated);
      app.get('/timeline', function (req, res) { res.send(200); });

      request(app)
        .get('/timeline')
        .expect(200, done);
    });
  });

  describe('.ensureRole', function () {
    it('should redirect to login', function (done) {

      app.use(authReject);
      app.use(auth.ensureRole('admin'));

      request(app)
        .get('/timeline')
        .expect(302)
        .end(function (err, res) {
          expect(res.headers.location).to.be('/login?returnUrl=/timeline');
          done();
        });
    });

    it('should forbid if user not defined', function (done) {

      app.use(authAccept);
      app.use(auth.ensureRole('admin'));

      request(app)
        .get('/timeline')
        .expect('<p>Forbidden</p>', done);
    });

    it('should forbid if user has no roles', function (done) {
      app.use(authAccept);
      app.use(auth.ensureRole('admin'));

      request(app)
        .get('/timeline')
        .expect('<p>Forbidden</p>', done);
    });

    it('should forbid if user is not in role', function (done) {
      app.use(authAcceptWithRoles('role1,role2'));
      app.use(auth.ensureRole('admin'));

      request(app)
        .get('/timeline')
        .expect('<p>Forbidden</p>', done);
    });

    it('should forbid if role not defined', function (done) {
      app.use(authAcceptWithRoles('role1,role2'));
      app.use(auth.ensureRole(null));

      request(app)
        .get('/timeline')
        .expect('<p>Forbidden</p>', done);
    });

    it('allows access by role', function (done) {
      app.use(authAcceptWithRoles('admin,role2'));
      app.use(auth.ensureRole('admin'));
      app.get('/timeline', function (req, res) { res.send(200); });

      request(app)
        .get('/timeline')
        .expect(200, done);
    });
  });

  describe('.requireRole', function () {
    it('redirects to login', function (done) {
      app.use(authReject);
      app.use(auth.requireRole('admin'));

      request(app)
        .get('/timeline')
        .expect(302)
        .end(function (err, res) {
          expect(res.headers.location).to.be('/login?returnUrl=/timeline');
          done();
        });
    });

    it('restricts if user not defined', function (done) {
      app.use(authAccept);
      app.use(auth.requireRole('admin'));

      request(app)
        .get('/timeline')
        .expect(403, done);
    });

    it('restricts if user has no roles', function (done) {
      app.use(authAccept);
      app.use(auth.requireRole('admin'));

      request(app)
        .get('/timeline')
        .expect(403, done);
    });

    it('restricts if user is not in role', function (done) {
      app.use(authAcceptWithRoles('role1,role2'));
      app.use(auth.requireRole('admin'));

      request(app)
        .get('/timeline')
        .expect(403, done);
    });

    it('restricts if role is not defined', function (done) {
      app.use(authAcceptWithRoles('role1,role2'));
      app.use(auth.requireRole(null));

      request(app)
        .get('/timeline')
        .expect(403, done);
    });

    it('allows access by role', function (done) {
      app.use(authAcceptWithRoles('role1,admin,role2'));
      app.use(auth.requireRole('admin'));
      app.get('/timeline', function (req, res) { res.send(200); });

      request(app)
        .get('/timeline')
        .expect(200, done);
    });
  });

  describe('.isUserInRole', function () {
    it('returns false when user is not defined', function (done) {
      expect(auth.isUserInRole(null, 'admin')).to.be(false);
      done();
    });

    it('returns false when user roles are not defined', function (done) {
      expect(auth.isUserInRole({}, 'admin')).to.be(false);
      done();
    });

    it('returns false when user is not in role', function (done) {
      expect(auth.isUserInRole({ roles: 'role1,role2' }, 'admin')).to.be(false);
      done();
    });

    it('returns false when role is not defined', function (done) {
      expect(auth.isUserInRole({ roles: 'role1' }, null)).to.be(false);
      done();
    });

    it('returns true when user is in role', function (done) {
      expect(auth.isUserInRole({ roles: 'admin,role2' }, 'admin')).to.be(true);
      done();
    });
  });
});