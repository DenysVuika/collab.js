'use strict';

var repository = require('./data')
	, config = require('./config')
	,	email = require('./collabjs.email.js')
	, jade = require('jade')
	, fs = require('fs');

var template_comment = jade.compile(fs.readFileSync(__dirname + '/config/templates/comment.jade', 'utf8'));

module.exports = function (app) {

  console.log('Initializing collabjs.web.api routes...');

  app.get('/api/mentions:topId?', requireAuthenticated, function (req, res) {
    var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
    repository.getMentions(req.user.account, _topId, function (err, result) {
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
    repository.getTimeline(req.params.account, _topId, function (err, result) {
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
    if (!req.body.content || req.body.content.length === 0) { return res.send(400); }
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
  });

  app.get('/api/timeline/posts/:id', requireAuthenticated, function (req, res) {
    repository.getPostWithComments(req.params.id, function (err, result) {
      if (err) { res.send(400); }
      else { res.json(200, result); }
    });
  });

  app.get('/api/timeline/posts/:id/comments', requireAuthenticated, function (req, res) {
    repository.getComments(req.params.id, function (err, result) {
      if (err) { res.send(400); }
      else { res.json(200, result); }
    });
  });

  app.get('/api/search', requireAuthenticated, function (req, res) {
    if (!req.query.q || !req.query.src) {
      res.send(400);
    } else {
      var _topId = (req.query.topId && req.query.topId > 0) ? req.query.topId : 0;
      repository.getPostsByHashTag(req.query.q, _topId, function (err, result) {
        if (err) { res.send(400); }
        else { res.json(200, result); }
      });
    }
  });

}; // module.exports

function notifyOnPostCommented(req, comment) {
  // send email notification (if enabled)
  if (config.smtp.enabled) {
    repository.getPostAuthor(comment.postId, function (err, user) {
      if (err || !user) { return; }
      if (user.id === req.user.id) { return; }
      var html = template_comment({
        user: req.user.name,
        profilePictureUrl: getGravatarUrl(req.user.pictureId),
        timelineUrl: getTimelineUrl(req.user.account),
        postUrl: getPostUrl(comment.postId),
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

function getPostUrl(postId) {
  return config.hostname + '/timeline/posts/' + postId;
}

function getTimelineUrl(account) {
  return config.hostname + '/people/' + account + '/timeline';
}

function getGravatarUrl(pictureId) {
  return 'https://www.gravatar.com/avatar/' + pictureId + '?s=48';
}

// Require user authentication prior to accessing resources.
function requireAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.writeHead(401); // Unauthorized
  return res.end();
}