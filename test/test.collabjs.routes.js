/* global describe, it, beforeEach */
'use strict';

var express = require('express')
  , request = require('supertest')
  , expect = require('expect.js')
  , runtime = require('../collabjs.runtime')
  , context = new runtime.RuntimeContext()
  , routes = require('../routes');

describe('collab.js routes', function () {

  var req = {};
  var res = {};

  beforeEach(function () {
    req = {
      flashMessageType: '',
      flashMessageText: '',
      flash: function (type, text) {
        this.flashMessageType = type;
        this.flashMessageText = text;
        return text;
      },
      query: {},
      params: {},
      user: {},
      body: {},
      login: function (opts, callback) { callback(null); },
      logout: function () {},
      session: {}
    };

    res = {
      viewName: '',
      locals: {},
      cookies: [],
      redirectPath: '',
      statusCode: 0,
      render: function (view, viewData) {
        this.statusCode = 200;
        this.viewName = view;
        this.locals = viewData;
      },
      cookie: function (name, value, opts) {
        this.cookies[name] = {
          name: name,
          value: value,
          opts: opts
        };
      },
      redirect: function (path) { this.redirectPath = path; },
      send: function (code) { this.statusCode = code; }
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
      expect(res.locals.account).to.be('dvuyka');
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
      req.session.destroy = function () { sessionDestroyed = true; };

      routes.logout(req, res);
      expect(loggedOut).to.be.ok();
      expect(sessionDestroyed).to.be.ok();
      expect(res.redirectPath).to.be('/');
    });

    it('redirects to `/`', function () {
      req.session.destroy = function () {};
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

  describe('get_account', function () {

    it('renders `core/account` view', function () {
      routes.get_account(req, res);
      expect(res.viewName).to.be('core/account');
    });
  });

  describe('post_account', function () {

    it('updates account', function() {
      context.data.updateAccount = function (id, json, callback) {
        callback(null);
      };

      routes.post_account(context)(req, res);
      expect(res.redirectPath).to.be('/account');
      expect(req.flashMessageType).to.be('info');
    });

    it('gets error from repository', function () {
      context.data.updateAccount = function (id, json, callback) {
        callback('Error');
      };
      routes.post_account(context)(req, res);
      expect(res.redirectPath).to.be('/account');
      expect(req.flashMessageType).to.be('error');
    });
  });

  describe('get_password', function () {

    it('renders `core/password` view', function () {
      routes.get_password(req, res);
      expect(res.viewName).to.be('core/password');
    });
  });

  describe('post_password', function () {

    it('changes password', function () {
      req.user.password = 'sha1$88d20177$1$d1b13be9e5b6198cee7f87f1d619562e7e509121'; // `secret`
      req.body = {
        pwdOld: 'secret',
        pwdNew: 'new-password',
        pwdConfirm: 'new-password'
      };
      context.data.setAccountPassword = function (userId, password, callback) {
        callback(null, 'new-password-hash');
      };
      routes.post_password(context)(req, res);
      expect(res.redirectPath).to.be('/account');
      expect(req.flashMessageType).to.be('info');
      expect(req.flashMessageText).to.be('Password has been successfully changed.');
      expect(req.user.password).to.be('new-password-hash');
    });

    it('detects incorrect values', function () {
      req.body = {
        pwdOld: 'value1',
        pwdNew: 'value2',
        pwnConfirm: 'value3'
      };
      routes.post_password(context)(req, res);
      expect(res.redirectPath).to.be('/account/password');
      expect(req.flashMessageType).to.be('error');
      expect(req.flashMessageText).to.be('Incorrect password values.');
    });

    it('detects new password is same as old', function () {
      req.body = {
        pwdOld: 'old-password',
        pwdNew: 'old-password',
        pwdConfirm: 'old-password'
      };
      routes.post_password(context)(req, res);
      expect(res.redirectPath).to.be('/account/password');
      expect(req.flashMessageType).to.be('info');
      expect(req.flashMessageText).to.be('New password is the same as old one.');
    });

    it('detects old password is wrong', function () {
      req.user.password = 'sha1$88d20177$1$d1b13be9e5b6198cee7f87f1d619562e7e509121'; // `secret`
      req.body = {
        pwdOld: 'old-password',
        pwdNew: 'new-password',
        pwdConfirm: 'new-password'
      };
      routes.post_password(context)(req, res);
      expect(res.redirectPath).to.be('/account/password');
      expect(req.flashMessageType).to.be('error');
      expect(req.flashMessageText).to.be('Invalid old password.');
    });

    it('gets error from repository', function () {
      req.user.password = 'sha1$88d20177$1$d1b13be9e5b6198cee7f87f1d619562e7e509121'; // `secret`
      req.body = {
        pwdOld: 'secret',
        pwdNew: 'new-password',
        pwdConfirm: 'new-password'
      };
      context.data.setAccountPassword = function (userId, password, callback) {
        callback('Error');
      };
      routes.post_password(context)(req, res);
      expect(res.redirectPath).to.be('/account/password');
      expect(req.flashMessageType).to.be('error');
      expect(req.flashMessageText).to.be('Error setting password.');
    });
  });

  describe('get_people', function () {

    it('renders `core/people` view', function () {
      routes.get_people(req, res);
      expect(res.viewName).to.be('core/people');
    });
  });

  describe('get_followers', function () {

    it('renders `core/people-followers` view', function () {
      context.data.getPublicProfile = function (callerAccount, targetAccount, callback) {
        callback(null, {});
      };
      routes.get_followers(req, res);
      expect(res.viewName).to.be('core/people-followers');
    });

    it('overrides sidebar selection to `/people`', function () {
      context.data.getPublicProfile = function (callerAccount, targetAccount, callback) {
        callback(null, {});
      };
      routes.get_followers(req, res);
      expect(res.locals.requestPath).to.be('/people');
    });
  });

  describe('get_following', function () {

    it('renders `core/people-following` view', function () {
      context.data.getPublicProfile = function (callerAccount, targetAccount, callback) {
        callback(null, {});
      };
      routes.get_following(req, res);
      expect(res.viewName).to.be('core/people-following');
    });

    it('overrides sidebar selection to `/people`', function () {
      context.data.getPublicProfile = function (callerAccount, targetAccount, callback) {
        callback(null, {});
      };
      routes.get_following(req, res);
      expect(res.locals.requestPath).to.be('/people');
    });
  });

  describe('get_personal_timeline', function () {

    it('renders `core/people-timeline` view', function () {
      context.data.getPublicProfile = function (callerAccount, targetAccount, callback) {
        callback(null, {});
      };

      routes.get_personal_timeline(req, res);
      expect(res.viewName).to.be('core/people-timeline');
    });
  });

  describe('get_timeline', function () {

    it('renders `core/timeline` view', function () {
      routes.get_timeline(req, res);
      expect(res.viewName).to.be('core/timeline');
    });
  });

  describe('get_post', function () {

    it('renders `core/post` view', function () {
      routes.get_post(req, res);
      expect(res.viewName).to.be('core/post');
    });

    it('overrides sidebar selection to `/timeline`', function () {
      routes.get_post(req, res);
      expect(res.locals.requestPath).to.be('/timeline');
    });

    it('passes `postId` to view', function () {
      req.params.postId = 10;
      routes.get_post(req, res);
      expect(res.locals.postId).to.be(10);
    });
  });

  describe('get_mentions', function () {

    it('renders `core/mentions` view', function () {
      routes.get_mentions(req, res);
      expect(res.viewName).to.be('core/mentions');
    });
  });

  describe('get_search', function () {

    it('renders `core/search-posts` view', function () {
      routes.get_search(req, res);
      expect(res.viewName).to.be('core/search-posts');
    });

    it('prepends `#` to search query', function () {
      req.query.q = 'test';
      routes.get_search(req, res);
      expect(res.locals.search_q).to.be('#test');
    });

    it('defaults `src` to `unknown` value', function () {
      routes.get_search(req, res);
      expect(res.locals.search_src).to.be('unknown');
    });

    it('encodes search query', function () {
      var q = req.query.q = 'hello world';
      routes.get_search(req, res);
      expect(res.locals.search_q_enc).to.be(encodeURIComponent('#' + q));
    });

    it('encodes search source', function () {
      req.query.q = 'test';
      var src = req.query.src = 'hello world';
      routes.get_search(req, res);
      expect(res.locals.search_src).to.be(encodeURIComponent(src));
    });

    it('generates variables for view', function () {
      req.query.q = 'test';
      req.query.src = 'hash';
      routes.get_search(req, res);
      expect(res.locals.navigationUri).to.be('/search?q=%23test&src=hash');
      expect(res.locals.search_q).to.be('#test');
      expect(res.locals.search_q_enc).to.be('%23test');
      expect(res.locals.search_src).to.be('hash');
    });
  });

  describe('post_search', function () {

    it('saves search list', function () {
      var saved = false;
      context.data.addSavedSearch = function (json, callback) {
        saved = true;
        callback(null);
      };
      req.body = { action: 'save', q: '#test', src: 'hash' };
      routes.post_search(context)(req, res);
      expect(res.redirectPath).to.be('/search?q=%23test&src=hash');
      expect(saved).to.be.ok();
    });

    it('removes saved list', function () {
      var removed = false;
      context.data.deleteSavedSearch = function (userId, name, callback) {
        removed = true;
        callback(null);
      };
      req.body = { action: 'delete', q: '#test', src: 'hash' };
      routes.post_search(context)(req, res);
      expect(res.redirectPath).to.be('/search?q=%23test&src=hash');
      expect(removed).to.be.ok();
    });

    it('redirects to result url without actions', function () {
      var executed = false;
      context.data.addSavedSearch = function (json, callback) {
        executed = true;
        callback(null);
      };
      context.data.deleteSavedSearch = function (userId, name, callback) {
        executed = true;
        callback(null);
      };
      req.body = { action: '', q: '#test', src: 'hash' };
      routes.post_search(context)(req, res);
      expect(res.redirectPath).to.be('/search?q=%23test&src=hash');
      expect(executed).to.not.be.ok();
    });
  });

  describe('get_help_article', function () {

    it('renders `help/index.md` by default', function () {
      context.fs = {
        readFile: function (path, encoding, callback) {
          callback(null, 'test article');
        }
      };
      routes.get_help_article(context)(req, res);
      expect(res.viewName).to.be('core/help');
      expect(res.locals.article).to.be('help/index.md');
      expect(res.locals.content).to.be('<p>test article</p>\n');
    });

    it('renders missing content', function () {
      context.fs = {
        readFile: function (path, encoding, callback) {
          callback('Error');
        }
      };
      req.params.article = 'missing_article';
      routes.get_help_article(context)(req, res);
      expect(res.viewName).to.be('core/help');
      expect(res.locals.article).to.be('help/missing_article.md');
      expect(res.locals.content).to.be('Content not found.');
    });

    it('overrides sidebar selection', function () {
      req.params.article = 'some_article';
      routes.get_help_article(context)(req, res);
      expect(res.locals.requestPath).to.be('/help');
    });
  });
});