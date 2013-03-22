'use strict';

/**
 * Route middleware to ensure user is authenticated.
 * Use this route middleware on any resource that needs to be protected.
 * If the request is authenticated (typically via a persistent Login session),
 * the request will proceed. Otherwise, the user will be redirected to the Login page.
 * @param req
 * @param res
 * @param next
 */
module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect('/login?returnUrl=' + req.url);
};

/**
 * Route middleware that requires user to be authenticated in order to proceed.
 * Use this route middleware on any resource that needs to be protected.
 * If the request is authenticated (typically via a persistent Login session),
 * the request will proceed. Otherwise, the user will get 401 (Unauthorized) HTTP response.
 * @param req
 * @param res
 * @param next
 */
module.exports.requireAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.writeHead(401); // Unauthorized
  return res.end();
};

module.exports.ensureRole = function (role) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login?returnUrl=' + req.url);
    } else if (req.user && req.user.roles && req.user.roles.split(',').indexOf(role) >= 0) {
      return next();
    } else {
      return res.render('core/403', {
        user: req.user,
        title: 'Forbidden'
      });
    }
  };
};

module.exports.requireRole = function (role) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login?returnUrl=' + req.url);
    } else if (req.user && req.user.roles && req.user.roles.split(',').indexOf(role) >= 0) {
      return next();
    } else {
      return res.send(403);
    }
  };
};

module.exports.isUserInRole = function(user, role) {
  if (user && user.roles && user.roles.split(',').indexOf(role) >= 0) {
    return true;
  } else {
    return false;
  }
};