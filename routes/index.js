'use strict';

var config = require('../config')
  , passwordHash = require('password-hash')
  , utils = require('../collabjs.utils')
  , Recaptcha = require('recaptcha').Recaptcha
  , NullRecaptcha = utils.NullRecaptcha;

/*
 * Utils
 */

function getRecaptchaForm() {
  // generate appropriate html content if recaptcha is enabled
  if (config.recaptcha.enabled) {
    var recaptcha = new Recaptcha(config.recaptcha.publicKey, config.recaptcha.privateKey);
    return recaptcha.toHTML();
  } else {
    return '';
  }
}

/*
 * GET home page.
 */

exports.index = function (req, res) {
  if (req.isAuthenticated()) {

    res.render('core/timeline', {
      title: 'Timeline',
      message: req.flash('error')
    });
    return;
  }

  res.render('core/index', {
    title: config.ui.brand,
    user: req.user
  });
};

/*
 * Login
 */

// GET: /login:returnUrl?
exports.get_login = function (req, res) {
  var account = '';
  if (req.signedCookies && req.signedCookies.account) {
    account = req.signedCookies.account;
  }

  res.render('core/login', {
    title: 'Sign In',
    formAction: req.url,
    account: account,
    message: req.flash('error')
  });
};

// POST: /login:returnUrl?
exports.post_login = function (req, res) {
  // save account for future reuse
  // (typically it will be used only to fill Login form)
  res.cookie('account', req.user.account, { maxAge: 900000, httpOnly: true, path: '/login', signed: true });
  // redirect if return url is provided
  var returnUrl = req.query.returnUrl;
  if (returnUrl && utils.isUrlLocalToHost(returnUrl)) {
    res.redirect(returnUrl);
  } else {
    res.redirect('/');
  }
};

// *: /logout
exports.logout = function (req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
};

/*
 * Account
 */

// GET: /register
exports.get_register = function (req, res) {
  // define variables for the 'register' form
  var locals = {
    title: 'Register',
    message: req.flash('error'),
    recaptcha_form: getRecaptchaForm(),
    data: {
      code: '',
      account: '',
      name: '',
      email: ''
    }
  };
  res.render('core/register', locals);
};

// POST: /register
exports.post_register = function (context) {

  var repository = context.data;

  return function (req, res) {
    var body = req.body;

    var locals = {
      title: 'Register',
      data: body
    };

    // check whether invitation codes are enabled
    if (config.invitation.enabled) {
      // validate invitation code
      if (!body.code || body.code.length === 0 || body.code !== config.invitation.code) {
        locals.data.code = '';
        locals.message = 'Wrong invitation code.';
        locals.recaptcha_form = getRecaptchaForm();
        res.render('core/register', locals);
        return;
      }
    }
    // instantiate a stub in case reCaptcha feature is disabled
    var recaptcha = new NullRecaptcha();
    // create real reCaptcha settings if enabled
    if (config.recaptcha.enabled) {
      // extract recaptcha-specific data
      var data = {
        remoteip: req.connection.remoteAddress,
        challenge: body.recaptcha_challenge_field,
        response: body.recaptcha_response_field
      };
      recaptcha = new Recaptcha(config.recaptcha.publicKey, config.recaptcha.privateKey, data);
    }

    // verify recaptcha
    recaptcha.verify(function (success) {
      if (!success) {
        // redisplay the form in case of error
        locals.message = 'Wrong verification code.';
        locals.recaptcha_form = getRecaptchaForm();
        res.render('core/register', locals);
        return;
      }

      // TODO: introduce better validation
      if (body.account && body.name && body.email && body.password) {
        var hashedPassword = passwordHash.generate(body.password);

        var user = {
          account: body.account,
          name: body.name,
          password: hashedPassword,
          email: body.email
        };

        repository.createAccount(user, function (err, result) {
          if (err) {
            locals.message = err;
            locals.recaptcha_form = getRecaptchaForm();
            res.render('core/register', locals);
            return;
          }

          req.login({ id: result.id, username: user.account, password: hashedPassword }, function (err) {
            if (err) {
              locals.message = 'Error authenticating user.';
              locals.recaptcha_form = getRecaptchaForm();
              return res.render('core/register', locals);
            } else {
              return res.redirect('/');
            }
          });
        });
      } else {
        locals.message = 'Error creating account.';
        locals.recaptcha_form = getRecaptchaForm();
        res.render('core/register', locals);
      }
    });
  };
};