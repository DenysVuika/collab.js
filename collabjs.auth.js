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

/**
 * Route middleware to ensure that current user is authenticated and assigned to a particular role.
 * Use this route middleware on any resource that needs to be protected.
 * If the request is authenticated and user is assigned expected role the request will proceed.
 * Otherwise, the user will be redirected to standard (or custom) 403 (Forbidden) page.
 * This middleware is typically used for web views.
 * @param {string} role Role name in lower case, eg. 'administrator'
 */
module.exports.ensureRole = function (role) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login?returnUrl=' + req.url);
    } else if (req.user && req.user.roles && req.user.roles.split(',').indexOf(role) >= 0) {
      return next();
    } else {
      return res.render('403', {
        user: req.user,
        title: 'Forbidden'
      });
    }
  };
};

/**
 * Route middleware that requires current user to be authenticated and assigned to a particular role.
 * Use this route middleware on any resource that needs to be protected.
 * If the request is authenticated and user is assigned expected role the request will proceed.
 * Otherwise, the user will get 403 (Forbidden) HTTP response.
 * This middleware is typically used for REST endpoints.
 * @param {string} role Role name in lower case, eg. 'administrator'
 */
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

/**
 * Checks whether user is assigned to the given role.
 * @param {Object} user User object
 * @param {string} role Role name
 * @returns {boolean} True is user is assigned to the given role. Otherwise, false.
 */
module.exports.isUserInRole = function(user, role) {
  return (user && user.roles && user.roles.split(',').indexOf(role) >= 0) ? true : false;
};