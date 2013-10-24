'use strict';

var config = require('../config')
  , passwordHash = require('password-hash')
  , marked = require('marked')
  , utils = require('../collabjs.utils')
  , Recaptcha = require('recaptcha').Recaptcha
  , NullRecaptcha = utils.NullRecaptcha;

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
              console.log('Error logging in with newly created account. ' + err);
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

// GET: /account
exports.get_account = function (req, res) {
  res.render('core/account', {
    title: 'Account Settings',
    error: req.flash('error'),
    info: req.flash('info')
  });
};

// POST: /account
exports.post_account = function (context) {
  var repository = context.data;
  return function (req, res) {
    var settings = req.body;
    repository.updateAccount(req.user.id, settings, function (err) {
      if (err) { req.flash('error', 'Error updating account settings.'); }
      else { req.flash('info', 'Account settings have been successfully updated.'); }
      res.redirect('/account');
    });
  };
};

// GET: /account/password
exports.get_password = function (req, res) {
  res.render('core/password', {
    title: 'Change password',
    error: req.flash('error'),
    info: req.flash('info')
  });
};

// POST: /account/password
exports.post_password = function (context) {
  var repository = context.data;
  return function (req, res) {
    var settings = req.body;

    // verify fields
    if (!settings.pwdOld || settings.pwdOld.length === 0 ||
      !settings.pwdNew || settings.pwdNew.length === 0 ||
      !settings.pwdConfirm || settings.pwdConfirm.length === 0 ||
      settings.pwdNew !== settings.pwdConfirm) {
      req.flash('error', 'Incorrect password values.');
      res.redirect('/account/password');
      return;
    }

    if (settings.pwdOld === settings.pwdNew) {
      req.flash('info', 'New password is the same as old one.');
      res.redirect('/account/password');
      return;
    }

    // verify old password
    if (!passwordHash.verify(settings.pwdOld, req.user.password)) {
      req.flash('error', 'Invalid old password.');
      res.redirect('/account/password');
      return;
    }

    repository.setAccountPassword(req.user.id, settings.pwdNew, function (err, hash) {
      if (err || !hash) {
        req.flash('error', 'Error setting password.');
        res.redirect('/account/password');
        return;
      }
      req.user.password = hash;
      req.flash('info', 'Password has been successfully changed.');
      res.redirect('/account');
    });
  };
};

/*
 * People
 */

exports.get_people = function (req, res) {
  res.render('core/people', {
    title: 'People'
  });
};

exports.get_followers = function (req, res) {
  res.render('core/people-followers', {
    title: req.params.account + ': followers',
    account: req.params.account,
    requestPath: '/people' // keep 'People' selected at sidebar
  });
};

exports.get_following = function (req, res) {
  res.render('core/people-following', {
    title: req.params.account + ': following',
    account: req.params.account,
    requestPath: '/people' // keep 'People' selected at sidebar
  });
};

exports.get_personal_timeline = function (req, res) {
  res.render('core/people-timeline', {
    title: req.params.account,
    account: req.params.account
  });
};


/*
 * Timeline
 */

exports.get_timeline = function (req, res) {
  res.render('core/timeline', {
    title: 'Timeline',
    message: req.flash('error')
  });
};

// GET: /timeline/posts/:postId
exports.get_post = function (req, res) {
  res.render('core/post', {
    title: 'Post',
    postId: req.params.postId,
    //error: 'Post not found'
    error: false,
    requestPath: '/'
  });
};

exports.get_mentions = function (req, res) {
  res.render('core/mentions', {
    title: 'Mentions'
  });
};

/*
 * Search
 */

exports.get_search = function (req, res) {
  // TODO: validate input
  var q = req.query.q;
  if (q && q.indexOf('#') !== 0) {
    q = '#' + q;
  }

  var src = req.query.src || 'unknown';

  res.render('core/search-posts', {
    title: 'Results for ' + q,
    navigationUri: '/search?q=' + encodeURIComponent(q) + '&src=' + src,
    search_q: q,
    search_q_enc: encodeURIComponent(q),
    search_src: encodeURIComponent(src),
    isSaved: res.locals.hasSavedSearch(q)
  });
};

exports.post_search = function (context) {
  var repository = context.data;
  return function (req, res) {
    var body = req.body
      , action = body.action
      , redirectUri = '/search?q=' + encodeURIComponent(body.q) + '&src=' + body.src;
    if (action === 'save') {
      console.log('saving search list...');
      repository.addSavedSearch({
        name: body.q,
        userId: req.user.id,
        q: encodeURIComponent(body.q),
        src: body.src
      }, function (err) {
        // TODO: generate error message for UI alert
        console.log(err);
        res.redirect(redirectUri);
      });
    } else if (action === 'delete') {
      console.log('deleting search list');
      repository.deleteSavedSearch(req.user.id, body.q, function (err) {
        // TODO: generate error message for UI alert
        console.log(err);
        res.redirect(redirectUri);
      });
    } else {
      console.log('unknown action ' + action);
      res.redirect(redirectUri);
    }
  };
};

/*
 * Help
 */

exports.get_help_article = function (context) {
  return function (req, res) {
    var article = 'help/index.md';
    if (req.params.article && req.params.article.length > 0) {
      article = 'help/' + req.params.article + '.md';
    }

    // get either proxied/mocked or real `fs` instance
    var fs = context.fs || require('fs');

    fs.readFile(article, 'utf8', function (err, data) {
      if (err) {
        res.render('core/help', {
          title: 'Help',
          article: article,
          message: req.flash('error'),
          content: 'Content not found.',
          requestPath: '/help' // keep 'Help' selected at sidebar
        });
        return;
      }
      res.render('core/help', {
        title: 'Help',
        article: article,
        message: req.flash('error'),
        content: marked(data),
        requestPath: '/help' // keep 'Help' selected at sidebar
      });
    });
  };
};

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

//  app.get('/accounts/:account/picture', function (req, res) {
//    repository.getProfilePicture(req.params.account, function (err, file) {
//      if (err || !file) {
//        res.set('ETag', '0');
//        res.sendfile(defaultProfilePicture);
//      } else {
//        if (req.get('if-none-match') === file.md5) {
//          res.send(304); // Not modified
//        } else {
//          res.set('Content-Type', file.mime)
//            .set('Content-Length', file.length)
//            .set('Last-Modified', file.lastModified)
//            .set('ETag', file.md5);
//          res.send(file.data);
//        }
//      }
//    });
//  });