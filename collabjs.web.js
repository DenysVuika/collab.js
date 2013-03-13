var repository = require('./data')
	, config = require('./config')
	, fs = require('fs')
	, crypto = require("crypto")
	, passport = require('passport')
	, passwordHash = require('password-hash')
	, marked = require('marked')
  , utils = require('./collabjs.utils.js')
  , Recaptcha = require('recaptcha').Recaptcha
  , NullRecaptcha = utils.NullRecaptcha;

module.exports = function (app) {

  console.log('Initializing collabjs.web routes...');

  app.get('/login:returnUrl?', function (req, res) {
    res.render('core/login', {
      settings: config.ui,
      title: 'Login',
      user: req.user,
      formAction: req.url,
      message: req.flash('error')
    });
  });

  app.post('/login:returnUrl?',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function (req, res) {
      var returnUrl = req.query.returnUrl;
      if (returnUrl && isUrlLocalToHost(returnUrl))
        res.redirect(returnUrl);
      else
        res.redirect('/');
    });

  app.all('/logout', function (req, res) {
    req.logout();
    // req.session.destroy();
    res.redirect('/');
  });

  app.get('/register', function (req, res) {
    // define variables for the 'register' form
    var locals = {
      settings: config.ui,
      title: 'Register',
      user: req.user,
      message: req.flash('error'),
      invitation: config.invitation.enabled,
      recaptcha: config.recaptcha.enabled
    };
    // generate appropriate html content if recaptcha is enabled
    if (config.recaptcha.enabled) {
      var recaptcha = new Recaptcha(config.recaptcha.publicKey, config.recaptcha.privateKey);
      locals.recaptcha_form = recaptcha.toHTML();
    }

    res.render('core/register', locals);
  });

  app.post('/register', function (req, res) {
    var body = req.body;
    // check whether invitation codes are enabled
    if (config.invitation.enabled) {
      // validate invitation code
      if (!body.invite || body.invite.length == 0 || body.invite !== config.invitation.code) {
        req.flash('error', 'Wrong invitation code.');
        return res.redirect('/register');
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
    recaptcha.verify(function (success, err) {
      if (!success) {
        console.log(err);
        // redisplay the form in case of error
        req.flash('error', 'Error in verification code.');
        return res.redirect('/register');
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
            req.flash('error', err);
            return res.redirect('/register');
          } else {
            req.login({ id: result.id, username: user.account, password: hashedPassword }, function (err) {
              if (err) {
                console.log('Error logging in with newly created account. ' + err);
                req.flash('error', 'Error authenticating user.');
                return res.redirect('/register');
              } else {
                return res.redirect('/timeline');
              }
            });
          }
        });
      }
      else {
        req.flash('error', 'Error creating account.');
        return res.redirect('/register');
      }
    });
  });

  app.get('/timeline/posts/:postId', ensureAuthenticated, function (req, res) {
    res.render('core/post', {
      settings: config.ui,
      title: 'Post',
      user: req.user,
      postId: req.params.postId,
      //error: 'Post not found'
      error: false
    });
  });

  app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('core/account', {
      settings: config.ui,
      title: 'Account Settings',
      user: req.user,
      error: req.flash('error'),
      info: req.flash('info')
    });
  });

  app.post('/account', ensureAuthenticated, function (req, res) {
    var settings = req.body;
    repository.updateAccount(req.user.id, settings, function (err) {
      if (err) req.flash('error', 'Error updating account settings.');
      else req.flash('info', 'Account settings have been successfully updated.');
      res.redirect('/account');
    });
  });

  app.get('/account/password', ensureAuthenticated, function (req, res) {
    res.render('core/password', {
      settings: config.ui,
      title: 'Change password',
      user: req.user,
      error: req.flash('error'),
      info: req.flash('info')
    });
  });

  app.post('/account/password', ensureAuthenticated, function (req, res) {
    var settings = req.body;

    // verify fields
    if (!settings.pwdOld || settings.pwdOld.length == 0
      || !settings.pwdNew || settings.pwdNew.length == 0
      || !settings.pwdConfirm || settings.pwdConfirm.length == 0
      || settings.pwdNew != settings.pwdConfirm) {
      req.flash('error', 'Incorrect password values.');
      return res.redirect('/account/password');
    }

    if (settings.pwdOld == settings.pwdNew) {
      req.flash('info', 'New password is the same as old one.');
      return res.redirect('/account/password');
    }

    // verify old password
    if (!passwordHash.verify(settings.pwdOld, req.user.password)) {
      req.flash('error', 'Invalid old password.');
      return res.redirect('/account/password');
    }

    repository.setAccountPassword(req.user.id, settings.pwdNew, function (err, hash) {
      if (err || !hash) {
        req.flash('error', 'Error setting password.');
        return res.redirect('/account/password');
      } else {
        req.user.password = hash;
        req.flash('info', 'Password has been successfully changed.');
        return res.redirect('/account');
      }
    });
  });

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

  app.get('/accounts/:account/profile', requireAuthenticated, function (req, res) {
    repository.getPublicProfile(req.user.account, req.params.account, function (err, result) {
      if (err || !result) res.send(400);
      else {
        res.render('core/profile-partial', {
          settings: config.ui,
          title: req.params.account,
          user: req.user,
          profile: result,
          // TODO: move to the stored procedure?
          isOwnProfile: req.user.account === result.account
        });
      }
    });
  });

  app.get('/people/:account/follow', ensureAuthenticated, function (req, res) {
    repository.followAccount(req.user.id, req.params.account, function (err, result) {
      res.redirect('/timeline');
    });
  });

  app.get('/people/:account/unfollow', ensureAuthenticated, function (req, res) {
    repository.unfollowAccount(req.user.id, req.params.account, function (err, result) {
      res.redirect('/timeline');
    });
  });

  app.get('/people', ensureAuthenticated, function (req, res) {
    res.render('core/people', {
      settings: config.ui,
      title: 'People',
      user: req.user
    });
  });

  app.get('/people/:account/followers', ensureAuthenticated, function (req, res) {
    res.render('core/people-followers', {
      settings: config.ui,
      title: req.params.account + ': followers',
      user: req.user,
      account: req.params.account
    });
  });

  app.get('/people/:account/following', ensureAuthenticated, function (req, res) {
    res.render('core/people-following', {
      settings: config.ui,
      title: req.params.account + ': following',
      user: req.user,
      account: req.params.account
    });
  });

  app.get('/people/:account/timeline', ensureAuthenticated, function (req, res) {
    res.render('core/people-timeline', {
      settings: config.ui,
      title: req.params.account,
      user: req.user,
      account: req.params.account
    });
  });

  app.get('/mentions', ensureAuthenticated, function (req, res) {
    res.render('core/mentions', {
      settings: config.ui,
      title: 'Mentions',
      user: req.user
    });
  });

  app.get('/timeline', ensureAuthenticated, function (req, res) {
    res.render('core/timeline', {
      settings: config.ui,
      title: 'Timeline',
      user: req.user,
      message: req.flash('error')
    })
  });

  app.get('/help/:article?', ensureAuthenticated, function (req, res) {
    var article = 'help/index.md';
    if (req.params.article && req.params.article.length > 0)
      article = 'help/' + req.params.article + '.md';
    renderHelpArticle(article, req, res);
  });

  app.get('/search', ensureAuthenticated, function (req, res) {

//    if (req.query.q) {
//      console.log('q found: ' + req.query.q);
//    }
//
//    if (req.query.src) {
//      console.log('src found: ' + req.query.src);
//    }

    // TODO: validate input

    var q = req.query.q;
    if (q.indexOf('#') != 0)
      q = '#' + q;

    return res.render('core/search-posts', {
      settings: config.ui,
      title: 'Search',
      user: req.user,
      search_q: encodeURIComponent(q),
      search_src: encodeURIComponent(req.query.src)
    });
  });

}; // module.exports

function renderHelpArticle(fileName, req, res) {
	fs.readFile(fileName, 'utf8', function (err, data) {
		if (err) {
			console.log('Error reading file ' + fileName + '. ' + err);
			res.render('core/help', {
				settings: config.ui,
			  title: 'Help',
			  user: req.user, 
			  message: req.flash('error'),
			  content: 'Content not found.'
			})
		} else {
			res.render('core/help', {
				settings: config.ui,
			  title: 'Help',
			  user: req.user, 
			  message: req.flash('error'),
			  content: marked(data)
			})
		}
	});
}

// Simple route middleware to ensure user is authenticated.
//  Use this route middleware on any resource that needs to be protected. If
//  the request is authenticated (typically via a persistent Login session),
//  the request will proceed. Otherwise, the user will be redirected to the Login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect('/login?returnUrl=' + req.url);
}

// Require user authentication prior to accessing resources.
function requireAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.writeHead(401); // Unauthorized
  return res.end();
}

function isUrlLocalToHost(url) {
  return !isStringEmpty(url) &&
    ((url[0] == '/' && (url.length == 1 || (url[1] != '/' && url[1] != '\\'))) || // "/" or "/foo" but not "//" or "/\"
      (url.length > 1 && url[0] == '~' && url[1] == '/' )); // "~/" or "~/foo"
}

function isStringEmpty(str) {
  return !(str && str != '');
}

// Middleware

var ensureRole = function (role) {
	return function (req, res, next) {
		if (!req.isAuthenticated())
			return res.redirect('/login?returnUrl=' + req.url);
		else if (req.user.roles && req.user.roles.split(',').indexOf(role) >= 0)
			return next();
		else {
			return res.render('core/403', {
				settings: config.ui,
				user: req.user,
				title: 'Forbidden'
			});
		}
	}
};

var requireRole = function (role) {
	return function (req, res, next) {
		if (!req.isAuthenticated())
			return res.redirect('/login?returnUrl=' + req.url);
		else if (req.user.roles && req.user.roles.split(',').indexOf(role) >= 0)
			return next();
		else
			return res.send(403);
	}
};