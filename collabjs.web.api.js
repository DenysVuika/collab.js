module.exports = function (context) {
  'use strict';

  var email = require('./collabjs.email.js')
    , jade = require('jade')
    , fs = require('fs')
    , passwordHash = require('password-hash')
    , marked = require('marked')
    , utils = require('./collabjs.utils')
    , config = context.config
    , repository = context.data
    , authenticate = context.auth.requireAuthenticated
    , noCache = utils.noCache;

  context.once('app.init.routes', function (app) {

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

    app.post('/api/account', authenticate, function (req, res) {
      repository.updateAccount(req.user.id, req.body, function (err) {
        if (err) { res.send(400); }
        else { res.send(200); }
      });
    });

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

    app.get('/api/mentions:topId?', authenticate, noCache, function (req, res) {
      repository.getMentions(req.user.id, req.user.account, getTopId(req), function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, { feed: result }); }
      });
    });

    app.get('/api/people:topId?', authenticate, noCache, function (req, res) {
      repository.getPeople(req.user.id, getTopId(req), function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, { feed: result }); }
      });
    });

    app.get('/api/people/:account/follow', authenticate, noCache, function (req, res) {
      repository.followAccount(req.user.id, req.params.account, handleHtmlResult(res));
    });

    app.get('/api/people/:account/unfollow', authenticate, noCache, function (req, res) {
      repository.unfollowAccount(req.user.id, req.params.account, handleHtmlResult(res));
    });

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

    app.get('/api/people/:account/timeline:topId?', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, function (err, result) {
        if (err || !result) {
          res.send(400);
          return;
        }

        var profile = result;

        repository.getTimeline(req.user.id, req.params.account, getTopId(req), function (err, result) {
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

    app.get('/api/accounts/:account/profile', authenticate, noCache, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, handleJsonResult(res));
    });

    // TODO: rename to '/api/news'
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
            pictureUrl: config.env.avatarServer + '/avatar/' + req.user.pictureId,
            content: req.body.content,
            created: date,
            commentsCount: 0,
            comments: []
          });
        }
      });
    });

    // TODO: rename to '/api/news'
    app.get('/api/timeline/posts:topId?', authenticate, noCache, function (req, res) {
      repository.getMainTimeline(req.user.id, getTopId(req), handleJsonResult(res));
    });

    app.del('/api/timeline/posts/:id', authenticate, function (req, res) {
      repository.deletePost(req.params.id, req.user.id, function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          res.writeHead(200);
          res.end();
        }
      });
    });

    app.get('/api/timeline/updates/count:topId?', authenticate, noCache, function (req, res) {
      repository.getTimelineUpdatesCount(req.user.id, getTopId(req), handleJsonResult(res));
    });

    app.get('/api/timeline/updates:topId?', authenticate, noCache, function (req, res) {
      repository.getTimelineUpdates(req.user.id, getTopId(req), handleJsonResult(res));
    });

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
          comment.pictureUrl = config.env.avatarServer + '/avatar/' + comment.pictureId;
          res.json(200, comment);
          // send email notification
          notifyOnPostCommented(req, comment);
        }
      });
    });

    app.get('/api/timeline/posts/:id', authenticate, noCache, function (req, res) {
      repository.getPostWithComments(req.params.id, handleJsonResult(res));
    });

    app.get('/api/timeline/posts/:id/comments', authenticate, noCache, function (req, res) {
      repository.getComments(req.params.id, handleJsonResult(res));
    });

    app.get('/api/search/list', authenticate, noCache, function (req, res) {
      repository.getSavedSearches(req.user.id, function (err, result) {
        if (err) { res.send(400, 'Error getting search lists.'); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/search', authenticate, noCache, function (req, res) {
      var userId = req.user.id
        , q = req.query.q
        , src = req.query.src;

      if (!userId || !q || !src) {
        res.send(400);
        return;
      }
      repository.getPostsByHashTag(userId, q, getTopId(req), function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          repository.hasSavedSearch(userId, q, function (err, isSaved) {
            res.json(200, {
              isSaved: isSaved,
              entries: result
            });
          });
        }
      });
    });

    app.post('/api/search', authenticate, function (req, res) {
      if (req.query.q) {
        repository.addSavedSearch({
          userId: req.user.id,
          name: req.query.q,
          q: encodeURIComponent(req.query.q),
          src: req.query.src || 'unknown'
        }, function (err) {
          if (err) { res.send(400, 'Error saving search list.'); }
          else { res.send(200); }
        });
      } else {
        res.send(400, 'Error saving search list.');
      }
    });

    app.del('/api/search', authenticate, function (req, res) {
      if (req.query.q) {
        repository.deleteSavedSearch(req.user.id, decodeURIComponent(req.query.q), function (err) {
          if (err) { res.send(400, 'Error deleting search list. '); }
          else { res.send(200); }
        });
      } else {
        res.send(400, 'Error deleting search list.');
      }
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
      return (req.query && req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
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

  var template_comment;

  function notifyOnPostCommented(req, comment) {
    // send email notification (if enabled)
    if (config.smtp.enabled) {
      // init template comment if it was not previously
      template_comment = template_comment || jade.compile(fs.readFileSync(__dirname + '/config/templates/comment.jade', 'utf8'));
      // get author of the post
      repository.getPostAuthor(comment.postId, function (err, user) {
        if (err || !user) { return; }
        if (user.id === req.user.id) { return; }
        var html = template_comment({
          user: req.user.name,
          profilePictureUrl: config.env.avatarServer + '/avatar/' + req.user.pictureId + '?s=48',
          timelineUrl: config.hostname + '/people/' + req.user.account + '/timeline',
          postUrl: config.hostname + '/timeline/posts/' + comment.postId,
          content: comment.content
        });
        var notification = {
          from: config.smtp.noreply,
          to: user.email,
          subject: req.user.name + ' commented on your post',
          generateTextFromHTML: true,
          html: html
        };
        email.sendMail(notification, function (err, response) {
          if (err) { console.log(err); }
          else { console.log('Message sent: ' + response.message); }
        });
      });
    }
  }
}; // module.exports