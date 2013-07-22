/* global describe, it, beforeEach */
'use strict';

var express = require('express')
  , request = require('supertest')
  , should = require('should')
  , expect = require('expect.js')
  , runtime = require('../collabjs.runtime')
  , context = new runtime.RuntimeContext()
  , routes = require('../routes');

describe('collab.js routes', function () {

  var req = {};
  var res = {};

  beforeEach(function () {
    req = {
      flash: function (errType) { return errType; },
      query: {},
      user: {},
      body: {},
      login: function (opts, callback) {
        callback(null);
      },
      logout: function () {},
      session: {
        destroy: function () {}
      }
    };

    res = {
      viewName: '',
      data: {},
      cookies: [],
      redirectPath: '',
      render: function (view, viewData) {
        this.viewName = view;
        this.data = viewData;
      },
      cookie: function (name, value, opts) {
        this.cookies[name] = {
          name: name,
          value: value,
          opts: opts
        };
      },
      redirect: function (path) {
        this.redirectPath = path;
      }
    };
  });

  describe('get_login', function () {

    it('renders `core/login` view', function () {
      routes.get_login(req, res);
      expect(res.viewName).to.be('core/login');
    });

    it('restores previous account', function () {
      req.signedCookies = {
        account: 'dvuyka'
      };

      routes.get_login(req, res);
      expect(res.data.account).to.be('dvuyka');
    });
  });

  describe('post_login', function () {

    it('saves account into cookie', function () {
      req.user.account = 'dvuyka';
      routes.post_login(req, res);
      expect(res.cookies).to.have.property('account');
      expect(res.cookies.account.value).to.be('dvuyka');
      expect(res.cookies.account.opts).to.eql({ maxAge: 900000, httpOnly: true, path: '/login', signed: true });
    });

    it('redirects to `returnUrl`', function () {
      req.query.returnUrl = '/help';
      routes.post_login(req, res);
      expect(res.redirectPath).to.be('/help');
    });

    it('redirects to `/`', function () {
      routes.post_login(req, res);
      expect(res.redirectPath).to.be('/');
    });
  });

  describe('logout', function () {

    it('logs out', function () {
      var loggedOut = false;
      var sessionDestroyed = false;

      req.logout = function () { loggedOut = true; };
      req.session = {
        destroy: function () { sessionDestroyed = true; }
      };

      routes.logout(req, res);
      expect(loggedOut).to.be.ok();
      expect(sessionDestroyed).to.be.ok();
      expect(res.redirectPath).to.be('/');
    });

    it('redirects to `/`', function () {
      routes.logout(req, res);
      expect(res.redirectPath).to.be('/');
    });
  });

  describe('get_register', function () {

    it('renders `core/register` view', function () {
      routes.get_register(req, res);
      expect(res.viewName).to.be('core/register');
    });
  });

  describe('post_register', function () {

    it('registers new account and redirects to `/timeline`', function () {
      req.body = {
        account: 'dvuyka',
        name: 'Denis Vuyka',
        email: 'some@email.com',
        password: 'some-password'
      };

      context.data.createAccount = function (json, callback) {
        callback(null, {id:1});
      };

      routes.post_register(context)(req, res);
      expect(res.redirectPath).to.be('/timeline');
    });

    it('reloads on missing body values', function () {
      req.body = {};
      context.data.createAccount = function (json, callback) {
        callback(null, {id:1});
      };

      routes.post_register(context)(req, res);
      expect(res.viewName).to.be('core/register');
    });

    it('reloads on error from repository', function () {
      req.body = {
        account: 'dvuyka',
        name: 'Denis Vuyka',
        email: 'some@email.com',
        password: 'some-password'
      };

      context.data.createAccount = function (json, callback) {
        callback('Error');
      };

      routes.post_register(context)(req, res);
      expect(res.viewName).to.be('core/register');
    });

    it('reloads if cannot login', function () {
      req.body = {
        account: 'dvuyka',
        name: 'Denis Vuyka',
        email: 'some@email.com',
        password: 'some-password'
      };

      context.data.createAccount = function (json, callback) {
        callback(null, {id:1});
      };

      req.login = function (opts, callback) {
        callback('Error');
      };

      routes.post_register(context)(req, res);
      expect(res.viewName).to.be('core/register');
    });
  });
});