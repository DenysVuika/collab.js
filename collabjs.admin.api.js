module.exports = function (context) {
  'use strict';

  var express = require('express')
    , utils = require('./collabjs.utils')
    , repository = context.data
    , authenticate = context.auth.requireAuthenticated
    , requireRole = context.auth.requireRole
    , noCache = utils.noCache;

  context.once(context.events.initWebRoutes, function (app) {

    var router = express.Router();

    router.use(authenticate);
    router.use(requireRole('administrator'));

    /*router.route('/')
      .get(noCache, function (req, res) {
        res.json(200, { 'root': '/' });
      });*/

    router.route('/accounts')
      .get(noCache, function (req, res) {
        repository.getAccounts(function (err, result) {
          if (err) {
            res.json(400);
          } else {
            res.json(200, result);
          }
        });
      });

    app.use('/api/admin', router);
  });
};