module.exports = function (context) {
  'use strict';

  var passwordHash = require('password-hash')
    , marked = require('marked')
    , utils = require('./collabjs.utils')
    , config = context.config
    , repository = context.data
    , authenticate = context.auth.requireAuthenticated
    , noCache = utils.noCache
    , passport = require('passport');

  context.once('app.init.routes', function (app) {

    function getUser(req) {
      var user = {
        account: req.user.account,
        name: req.user.name,
        roles: [],
        pictureUrl: utils.getAvatarUrl(req.user.pictureId)
      };

      if (req.user.roles) {
        user.roles = req.user.roles.split(',');
      }

      return user;
    }

    app.post('/api/auth/login', passport.authenticate('local'), function (req, res) {
      res.send(getUser(req));
    });

    app.get('/api/auth/check', function(req, res) {
      res.send(req.isAuthenticated() ? getUser(req) : '0');
    });

    app.post('/api/auth/logout', function (req, res) {
      req.logout();
      //req.session.destroy();
      res.send(200);
    });

    app.post('/api/account/register', function (req, res) {

      if (!config.server.allowUserRegistration) {
        res.send(400, 'Registration is not allowed with current configuration.');
        return;
      }

      var body = req.body;
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
          if (err) { res.send(400, err); }
          else {
            req.login({ id: result.id, username: user.account, password: hashedPassword }, function (err) {
              if (err) { res.send(400, 'Error authenticating user.'); }
              else { res.send(200); }
            });
          }
        });
      } else {
        res.send(400, 'Error creating account.');
      }
    });

    // TODO: rename to '/api/profile'
    app.get('/api/account', authenticate, noCache, function (req, res) {
      res.json(200, {
        token: config.server.csrf ? req.csrfToken() : null,
        avatarServer: config.env.avatarServer,
        pictureUrl: req.user.pictureUrl,
        name: req.user.name,
        location: req.user.location,
        website: req.user.website,
        bio: req.user.bio
      });
    });

    // TODO: rename to '/api/profile'
    app.post('/api/account', authenticate, function (req, res) {
      repository.updateAccount(req.user.id, req.body, function (err) {
        if (err) { res.send(400); }
        else { res.send(200); }
      });
    });

    // TODO: rename to '/api/profile/password'
    app.post('/api/account/password', authenticate, function(req, res) {
      var settings = req.body;

      // verify fields
      if (!settings.pwdOld || settings.pwdOld.length === 0 ||
        !settings.pwdNew || settings.pwdNew.length === 0 ||
        !settings.pwdConfirm || settings.pwdConfirm.length === 0 ||
        settings.pwdNew !== settings.pwdConfirm) {
        res.send(400, 'Incorrect password values.');
        return;
      }

      // verify old password
      if (!passwordHash.verify(settings.pwdOld, req.user.password)) {
        res.send(400, 'Invalid old password.');
        return;
      }

      if (settings.pwdOld === settings.pwdNew) {
        res.send(400, 'New password is the same as old one.');
        return;
      }

      repository.setAccountPassword(req.user.id, settings.pwdNew, function (err, hash) {
        if (err || !hash) {
          res.send(400, 'Error setting password.');
          return;
        }
        req.user.password = hash;
        res.send(200, 'Password has been successfully changed.');
      });
    });

    // TODO: move 'topId' to http header
    app.get('/api/people:topId?', authenticate, noCache, function (req, res) {
      repository.getPeople(req.user.id, getTopId(req), function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });


    app.post('/api/u/:account/follow', authenticate, function (req, res) {
      var account = req.params.account;
      if (account) {
        repository.followAccount(req.user.id, account, handleHtmlResult(res));
      } else {
        res.send(400);
      }
    });

    app.post('/api/u/:account/unfollow', authenticate, function (req, res) {
      var account  = req.params.account;
      if (account) {
        repository.unfollowAccount(req.user.id, account, handleHtmlResult(res));
      } else {
        res.send(400);
      }
    });

    // TODO: rename to '/api/u/:account/followers:topId?'
    // TODO: move 'topId' to http header
    app.get('/api/people/:account/followers:topId?', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, function (err, result) {
        if (err || !result) {
          res.send(400);
          return;
        }

        var profile = result;

        repository.getFollowers(req.user.id, profile.id, function (err, result) {
          if (err || !result) { res.send(400);}
          else { res.json(200, { user: profile, feed: result }); }
        });
      });
    });

    // TODO: rename to '/api/u/:account/following:topId?'
    // TODO: move 'topId' to http header
    app.get('/api/people/:account/following:topId?', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, function (err, result) {
        if (err || !result) {
          res.send(400);
          return;
        }

        var profile = result;

        repository.getFollowing(req.user.id, profile.id, function (err, result) {
          if (err || !result) { res.send(400);}
          else { res.json(200, { user: profile, feed: result }); }
        });
      });
    });

    // TODO: rename to '/api/u/:account/posts'
    // TODO: move 'topId' to http header
    app.get('/api/people/:account/timeline:topId?', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, function (err, result) {
        if (err || !result) {
          res.send(400);
          return;
        }

        var profile = result;

        repository.getWall(profile.id, getTopId(req), function (err, result) {
          if (err || !result) { res.send(400); }
          else {
            res.json(200, {
              user: profile,
              feed: result
            });
          }
        });

      });
    });

    // TODO: rename to '/api/u/:account/profile'
    app.get('/api/accounts/:account/profile', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, handleJsonResult(res));
    });

    // TODO: rename to '/api/wall' or '/api/posts'
    app.post('/api/timeline/posts', authenticate, function (req, res) {
      var date = new Date();
      var post = {
        userId: req.user.id,
        content: req.body.content,
        created: date
      };

      repository.addPost(post, function (err, postId) {
        if (err || !postId) { res.send(400); }
        else {
          res.json(200, {
            id: postId,
            account: req.user.account,
            name: req.user.name,
            pictureId: req.user.pictureId,
            pictureUrl: utils.getAvatarUrl(req.user.pictureId),
            content: req.body.content,
            created: date,
            commentsCount: 0,
            comments: []
          });
        }
      });
    });

    app.get('/api/news', authenticate, noCache, function (req, res) {
      var lastId = parseInt(req.header('last-known-id'));
      if (isNaN(lastId) || lastId < 0) {
        lastId = 0;
      }
      // check for 'retrieve-mode' header
      var mode = req.header('retrieve-mode');
      if (mode) {
        mode = mode.toLowerCase();
        // only updates count should be returned
        if (mode === 'count-updates') {
          repository.checkNewsUpdates(req.user.id, lastId, handleJsonResult(res));
        }
        // updates should be returned
        else if (mode === 'get-updates') {
          repository.getNewsUpdates(req.user.id, lastId, handleJsonResult(res));
        }
      }
      // just return the regular News content
      else {
        repository.getNews(req.user.id, lastId, handleJsonResult(res));
      }
    });

    // TODO: rename to '/api/posts/:postId'
    // Delete post from personal wall and followers' News
    app.del('/api/wall/:postId', authenticate, function (req, res) {
      repository.deleteWallPost(req.user.id, req.params.postId,  function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          res.writeHead(200);
          res.end();
        }
      });
    });

    // Delete (mute) post from personal News
    app.del('/api/news/:postId', authenticate, function (req, res) {
      repository.deleteNewsPost(req.user.id, req.params.postId, function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          res.writeHead(200);
          res.end();
        }
      });
    });

    // TODO: rename to '/api/posts/:p/comments'
    app.post('/api/timeline/comments', authenticate, function (req, res) {
      if (!req.body.content || req.body.content.length === 0) {
        res.send(400);
        return;
      }
      var comment = {
        userId: req.user.id,
        postId: req.body.postId,
        created: new Date(),
        content: req.body.content
      };
      repository.addComment(comment, function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          comment.id = result.id;
          comment.account = req.user.account;
          comment.name = req.user.name;
          comment.pictureId = req.user.pictureId;
          comment.pictureUrl = utils.getAvatarUrl(comment.pictureId);
          res.json(200, comment);
        }
      });
    });

    // TODO: rename to '/api/posts/:p
    app.get('/api/timeline/posts/:id', authenticate, noCache, function (req, res) {
      repository.getPostWithComments(req.params.id, handleJsonResult(res));
    });

    // TODO: rename to '/api/posts/:p/comments
    app.get('/api/timeline/posts/:id/comments', authenticate, noCache, function (req, res) {
      repository.getComments(req.params.id, handleJsonResult(res));
    });

    app.get('/api/explore/:tag', authenticate, function (req, res) {
      var lastId = parseInt(req.header('last-known-id'));
      if (isNaN(lastId) || lastId < 0) {
        lastId = 0;
      }

      repository.getPostsByHashTag(req.user.id, req.params.tag, lastId, handleJsonResult(res));
    });

    app.get('/api/help/:article?', authenticate, function (req, res) {
      var article = 'help/index.md';
      if (req.params.article && req.params.article.length > 0) {
        article = 'help/' + req.params.article + '.md';
      }

      // get either proxied/mocked or real `fs` instance
      var fs = context.fs || require('fs');

      fs.readFile(article, 'utf8', function (err, data) {
        if (err) {
          res.send(404);
          return;
        }
        res.send(200, marked(data));
      });
    });

    // UTILS

    function getTopId(req) {
      if (req.query && req.query.topId) {
        var topId = parseInt(req.query.topId);
        return isNaN(topId) || topId < 0 ? 0 : topId;
      }
      return 0;
    }

    function handleJsonResult(res) {
      return function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      };
    }

    function handleHtmlResult(res) {
      return function (err) {
        if (err) { res.send(400); }
        else { res.send(200); }
      };
    }
  }); // app.init.routes
}; // module.exports