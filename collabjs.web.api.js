module.exports = function (context) {
  'use strict';

  var email = require('./collabjs.email.js')
    , jade = require('jade')
    , fs = require('fs')
    , config = context.config
    , repository = context.data
    , authenticate = context.auth.requireAuthenticated;

  context.once('app.init.routes', function (app) {

    app.get('/api/mentions:topId?', authenticate, function (req, res) {
      repository.getMentions(req.user.id, req.user.account, getTopId(req), function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          res.json(200, {
            feed: result
          });
        }
      });
    });

    app.get('/api/people:topId?', authenticate, function (req, res) {
      repository.getPeople(req.user.id, getTopId(req), function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          res.json(200, {
            feed: result
          });
        }
      });
    });

    app.get('/api/people/:account/follow', authenticate, function (req, res) {
      repository.followAccount(req.user.id, req.params.account, handleHtmlResult(req, res));
    });

    app.get('/api/people/:account/unfollow', authenticate, function (req, res) {
      repository.unfollowAccount(req.user.id, req.params.account, handleHtmlResult(req, res));
    });

    app.get('/api/people/:account/followers:topId?', authenticate, function (req, res) {

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

    app.get('/api/people/:account/following:topId?', authenticate, function (req, res) {

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

    app.get('/api/people/:account/timeline:topId?', authenticate, function (req, res) {

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

    app.get('/api/accounts/:account/profile', authenticate, function (req, res) {
      repository.getPublicProfile(req.user.id, req.params.account, handleJsonResult(req, res));
    });

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
            id: postId.id,
            account: req.user.account,
            name: req.user.name,
            pictureId: req.user.pictureId,
            content: req.body.content,
            created: date,
            commentsCount: 0,
            comments: []
          });
        }
      });
    });

    app.get('/api/timeline/posts:topId?', authenticate, function (req, res) {
      repository.getMainTimeline(req.user.id, getTopId(req), handleJsonResult(req, res));
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

    app.get('/api/timeline/updates/count:topId?', authenticate, function (req, res) {
      repository.getTimelineUpdatesCount(req.user.id, getTopId(req), handleJsonResult(req, res));
    });

    app.get('/api/timeline/updates:topId?', authenticate, function (req, res) {
      repository.getTimelineUpdates(req.user.id, getTopId(req), handleJsonResult(req, res));
    });

    app.post('/api/timeline/comments', authenticate, function (req, res) {
      if (!req.body.content || req.body.content.length === 0) {
        res.send(400);
        return;
      }
      var created = new Date()
        , comment = {
            userId: req.user.id,
            postId: req.body.postId,
            created: created,
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

    app.get('/api/timeline/posts/:id', authenticate, function (req, res) {
      repository.getPostWithComments(req.params.id, handleJsonResult(req, res));
    });

    app.get('/api/timeline/posts/:id/comments', authenticate, function (req, res) {
      repository.getComments(req.params.id, handleJsonResult(req, res));
    });

    app.get('/api/search', authenticate, function (req, res) {
      if (!req.query.q || !req.query.src) {
        res.send(400);
        return;
      }
      repository.getPostsByHashTag(req.user.id, req.query.q, getTopId(req), handleJsonResult(req, res));
    });

    // UTILS

    function getTopId(req) {
      return (req.query && req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
    }

    function handleJsonResult(req, res) {
      return function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      };
    }

    function handleHtmlResult(req, res) {
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