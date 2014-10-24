module.exports = function (context) {
  'use strict';

  var express = require('express')
    , passwordHash = require('password-hash')
    , utils = require('./collabjs.utils')
    , repository = context.data
    , authenticate = context.auth.requireAuthenticated
    , requireRole = context.auth.requireRole
    , noCache = utils.noCache;

  context.once(context.events.initWebRoutes, function (app) {

    var router = express.Router();

    router.use(authenticate);
    router.use(requireRole('administrator'));

    router.route('/accounts')
      .get(noCache, function (req, res) {
        repository.getAccounts(function (err, result) {
          if (err) {
            res.status(400).end();
          } else {
            res.json(result);
          }
        });
      })
      .post(function (req, res) {
        var user = {
          account: req.body.account,
          name: req.body.name,
          password: passwordHash.generate(req.body.password),
          email: req.body.email
        };

        repository.createAccount(user, function (err, result) {
          if (err) { res.send(400, err); }
          else {
            // notify running modules on user registration
            context.emit(context.events.userRegistered, { id: result.id, account: user.account });
            res.send(200);
          }
        });
      });

    router.route('/accounts/a/:account')
      .get(noCache, function (req, res) {
        repository.getAccount(req.params.account, function (err, result) {
          if (err) { res.status(400).end(); }
          else {
            delete result.password;
            res.json(result);
          }
        });
      })
      .post(function (req, res) {
        var json = req.body;
        var id = json.id;
        var account = {
          name: json.name,
          location: json.location,
          website: json.website,
          bio: json.bio
        };
        repository.updateAccount(id, account, function (err) {
          if (err) { res.status(400).end(); }
          else { res.status(200).end(); }
        });
      })
      .delete(function (req, res) {
        repository.deleteAccount(req.params.account, function (err) {
          if (err) { res.send(400, err); }
          else { res.send(200); }
        });
      });

    router.route('/accounts/a/:account/pwd')
      .post(function (req, res) {
        // TODO: add validation
        repository.setPassword(
          req.params.account,
          req.body.password,
          function (err) {
            if (err) { res.send(400, err); }
            else { res.send(200); }
          }
        );
      });

    app.use('/api/admin', router);
  });
};