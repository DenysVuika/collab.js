'use strict';

var email = require('./collabjs.email.js')
	, jade = require('jade')
	, fs = require('fs');

module.exports = function (context) {
  var config = context.config
    , repository = context.data
    , requireAuthenticated = context.auth.requireAuthenticated;

  context.once('app.init.routes', function (app) {
    app.get('/api/mentions:topId?', requireAuthenticated, function (req, res) {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getMentions(req.user.id, req.user.account, _topId, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/people:topId?', requireAuthenticated, function (req, res) {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getPeople(req.user.id, _topId, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/people/:account/followers:topId?', requireAuthenticated, function (req, res) {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getFollowers(req.user.id, req.params.account, _topId, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/people/:account/following:topId?', requireAuthenticated, function (req, res) {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getFollowing(req.user.id, req.params.account, _topId, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/people/:account/timeline:topId?', requireAuthenticated, function (req, res) {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getTimeline(req.user.id, req.params.account, _topId, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/accounts/:account/profile', requireAuthenticated, function (req, res) {
      repository.getPublicProfile(req.user.account, req.params.account, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.post('/api/timeline/posts', requireAuthenticated, function (req, res) {
      var date = new Date();
      var post = {
        userId: req.user.id,
        content: req.body.content,
        created: date
      };

      repository.addPost(post, function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          res.json(200, {
            id: result.id,
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

    app.get('/api/timeline/posts:topId?', requireAuthenticated, function (req, res) {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getMainTimeline(req.user.id, _topId, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.del('/api/timeline/posts/:id', requireAuthenticated, function (req, res) {
      repository.deletePost(req.params.id, req.user.id, function (err, result) {
        if (err || !result) { res.send(400); }
        else {
          res.writeHead(200);
          res.end();
        }
      });
    });

    app.get('/api/timeline/updates/count:topId?', requireAuthenticated, function (req, res) {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getTimelineUpdatesCount(req.user.id, _topId, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/timeline/updates:topId?', requireAuthenticated, function (req, res) {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getTimelineUpdates(req.user.id, _topId, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.post('/api/timeline/comments', requireAuthenticated, function (req, res) {
      if (!req.body.content || req.body.content.length === 0) { res.send(400); }
      else {
        var created = new Date();
        var comment = {
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
            res.json(200, comment);
            // send email notification
            notifyOnPostCommented(req, comment);
          }
        });
      }
    });

    app.get('/api/timeline/posts/:id', requireAuthenticated, function (req, res) {
      repository.getPostWithComments(req.params.id, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/timeline/posts/:id/comments', requireAuthenticated, function (req, res) {
      repository.getComments(req.params.id, function (err, result) {
        if (err || !result) { res.send(400); }
        else { res.json(200, result); }
      });
    });

    app.get('/api/search', requireAuthenticated, function (req, res) {
      if (!req.query.q || !req.query.src) {
        res.send(400);
      } else {
        var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
        repository.getPostsByHashTag(req.user.id, req.query.q, _topId, function (err, result) {
          if (err || !result) { res.send(400); }
          else { res.json(200, result); }
        });
      }
    });
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