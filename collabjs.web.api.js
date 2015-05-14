module.exports = function (context) {
  'use strict';

  var passwordHash = require('password-hash')
    , MarkdownIt = require('markdown-it')
    , md = new MarkdownIt()
    , utils = require('./collabjs.utils')
    , config = context.config
    , repository = context.data
    , authenticate = context.auth.requireAuthenticated
    , noCache = utils.noCache
    , passport = require('passport');

  context.once(context.events.initWebRoutes, function (app) {

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
      res.json(getUser(req));
    });

    app.get('/api/auth/check', function(req, res) {
      res.send(req.isAuthenticated() ? getUser(req) : '0');
    });

    app.post('/api/auth/logout', function (req, res) {
      req.logout();
      //req.session.destroy();
      res.status(200).end();
    });

    app.post('/api/account/register', function (req, res) {

      if (!config.server.allowUserRegistration) {
        res.status(400).send('Registration is not allowed with current configuration.');
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
          if (err) { res.status(400).send(err); }
          else {
            req.login({ id: result.id, username: user.account, password: hashedPassword }, function (err) {
              if (err) { res.status(400).send('Error authenticating user.'); }
              else {
                // notify running modules on user registration
                context.emit(context.events.userRegistered, { id: result.id, account: user.account });
                res.status(200).end();
              }
            });
          }
        });
      } else {
        res.status(400).send('Error creating account.');
      }
    });

    app.route('/api/profile')
      .all(authenticate)
      .get(noCache, function (req, res) {
        res.json({
          token: config.server.csrf ? req.csrfToken() : null,
          avatarServer: config.env.avatarServer,
          pictureUrl: req.user.pictureUrl,
          name: req.user.name,
          email: req.user.email,
          location: req.user.location,
          website: req.user.website,
          bio: req.user.bio
        });
      })
      .post(function (req, res) {
        repository.updateAccount(req.user.id, req.body, function (err) {
          if (err) { res.status(400).end(); }
          else { res.status(200).end(); }
        });
      });

    // TODO: move confirmation check to the client
    app.post('/api/profile/password', authenticate, function(req, res) {
      var settings = req.body;

      // verify fields
      if (!settings.pwdOld ||
        !settings.pwdNew ||
        !settings.pwdConfirm ||
        settings.pwdNew !== settings.pwdConfirm) {
        res.status(400).send('Incorrect password values.');
        return;
      }

      // verify old password
      if (!passwordHash.verify(settings.pwdOld, req.user.password)) {
        res.status(400).send('Invalid old password.');
        return;
      }

      if (settings.pwdOld === settings.pwdNew) {
        res.status(400).send('New password is the same as old one.');
        return;
      }

      repository.setAccountPassword(req.user.id, settings.pwdNew, function (err, hash) {
        if (err || !hash) {
          res.status(400).send('Error setting password.');
          return;
        }
        req.user.password = hash;
        res.status(200).send('Password has been successfully changed.');
      });
    });

    app.post('/api/profile/email', authenticate, function (req, res) {
      var settings = req.body;

      if (!settings.oldValue || !settings.newValue) {
        res.status(400).send('Incorrect email values');
        return;
      }

      if (settings.oldValue === settings.newValue) {
        res.status(400).send('New email is the same as old one.');
        return;
      }

      repository.setAccountEmail(req.user.id, settings.newValue, function (err) {
        if (err) {
          res.status(400).send('Error setting email.');
          return;
        }
        req.user.email = settings.newValue;
        res.status(200).send('Email has been successfully changed.');
      });
    });

    app.get('/api/people', authenticate, noCache, function (req, res) {
      var lastId = parseInt(req.header('last-known-id'));
      if (isNaN(lastId) || lastId < 0) {
        lastId = 0;
      }
      repository.getPeople(req.user.id, lastId, function (err, result) {
        if (err || !result) { res.status(400).end(); }
        else { res.json(result); }
      });
    });


    app.post('/api/u/:account/follow', authenticate, function (req, res) {
      var account = req.params.account;
      if (account) {
        repository.followAccount(req.user.id, account, function (err) {
          res.status(err ? 400 : 200).end();
        });
      } else {
        res.status(400).end();
      }
    });

    app.post('/api/u/:account/unfollow', authenticate, function (req, res) {
      var account  = req.params.account;
      if (account) {
        repository.unfollowAccount(req.user.id, account, function (err) {
          res.status(err ? 400 : 200).end();
        });
      } else {
        res.status(400).end();
      }
    });

    app.get('/api/u/:account/followers', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, function (err, result) {
        if (err || !result) {
          res.status(400).end();
          return;
        }

        var profile = result;

        repository.getFollowers(req.user.id, profile.id, function (err, result) {
          if (err || !result) { res.status(400).end();}
          else { res.json({ user: profile, feed: result }); }
        });
      });
    });

    app.get('/api/u/:account/following', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, function (err, result) {
        if (err || !result) {
          res.status(400).end();
          return;
        }

        var profile = result;

        repository.getFollowing(req.user.id, profile.id, function (err, result) {
          if (err || !result) { res.status(400).end();}
          else { res.json({ user: profile, feed: result }); }
        });
      });
    });

    app.get('/api/u/:account/posts', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, function (err, result) {
        if (err || !result) {
          res.status(400).end();
          return;
        }

        var profile = result;

        var lastId = parseInt(req.header('last-known-id'));
        if (isNaN(lastId) || lastId < 0) {
          lastId = 0;
        }

        repository.getWall(profile.id, lastId, function (err, result) {
          if (err || !result) { res.status(400).end(); }
          else {
            res.json({
              user: profile,
              feed: result
            });
          }
        });

      });
    });

    app.post('/api/u/posts', authenticate, function (req, res) {
      var date = new Date();
      var post = {
        userId: req.user.id,
        content: req.body.content,
        created: date
      };

      repository.addPost(post, function (err, postId) {
        if (err || !postId) { res.status(400).end(); }
        else {
          res.json({
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

    // Delete post from personal wall and followers' News
    app.delete('/api/posts/:postId', authenticate, function (req, res) {
      repository.deleteWallPost(req.user.id, req.params.postId,  function (err, result) {
        if (err || !result) { res.status(400).end(); }
        else {
          res.writeHead(200);
          res.end();
        }
      });
    });

    // Delete (mute) post from personal News
    app.delete('/api/news/:postId', authenticate, function (req, res) {
      repository.deleteNewsPost(req.user.id, req.params.postId, function (err, result) {
        if (err || !result) { res.status(400).end(); }
        else {
          res.writeHead(200);
          res.end();
        }
      });
    });

    app.get('/api/posts/:id', authenticate, noCache, function (req, res) {
      repository.getPost(req.params.id, handleJsonResult(res));
    });

    app.route('/api/posts/:id/comments')
      .all(authenticate)
      .get(noCache, function (req, res) {
        repository.getComments(req.params.id, handleJsonResult(res));
      })
      .post(function (req, res) {
        if (!req.body.content) {
          res.status(400).end();
          return;
        }

        var postId = parseInt(req.params.id);
        if (isNaN(postId) || postId < 0) {
          res.status(400).end();
          return;
        }

        var comment = {
          userId: req.user.id,
          postId: postId,
          created: new Date(),
          content: req.body.content
        };
        repository.addComment(comment, function (err, result) {
          if (err || !result) { res.status(400).end(); }
          else {
            comment.id = result.id;
            comment.account = req.user.account;
            comment.name = req.user.name;
            comment.pictureId = req.user.pictureId;
            comment.pictureUrl = utils.getAvatarUrl(comment.pictureId);
            res.json(comment);
          }
        });
      });

    app.route('/api/posts/:id/lock')
      .all(authenticate)
      .post(function (req, res) {
        var postId = parseInt(req.params.id);
        if (isNaN(postId) || postId < 0) {
          res.status(400).end();
          return;
        }
        repository.lockPost(req.user.id, postId, function () {
          res.status(200).end();
        });
      })
      .delete(function (req, res) {
        var postId = parseInt(req.params.id);
        if (isNaN(postId) || postId < 0) {
          res.status(400).end();
          return;
        }
        repository.unlockPost(req.user.id, postId, function () {
          res.status(200).end();
        });
      });

    app.route('/api/posts/:id/like')
      .all(authenticate)
      .post(function (req, res) {
        var postId = parseInt(req.params.id);
        if (isNaN(postId) || postId < 0) {
          res.status(400).end();
          return;
        }
        repository.addLike(req.user.id, postId, function () {
          res.status(200).end();
        });
      })
      .delete(function (req, res) {
        var postId = parseInt(req.params.id);
        if (isNaN(postId) || postId < 0) {
          res.status(400).end();
          return;
        }
        repository.removeLike(req.user.id, postId, function () {
          res.status(200).end();
        });
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
          res.status(404).end();
          return;
        }
        res.status(200).send(md.render(data));
      });
    });

    // UTILS

    function handleJsonResult(res) {
      return function (err, result) {
        if (err || !result) { res.status(400).end(); }
        else { res.json(result); }
      };
    }
  }); // app.init.routes
}; // module.exports
