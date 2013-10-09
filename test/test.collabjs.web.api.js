/* global describe, it, beforeEach */
'use strict';

var express = require('express')
  , request = require('supertest')
  , expect = require('expect.js')
  , runtime = require('../collabjs.runtime')
  , RuntimeEvents = runtime.RuntimeEvents;

describe('collab.js web.api', function () {

  var app = express()
    , context = new runtime.RuntimeContext()
    , webApi = require('../collabjs.web.api')(context);

  // user to authenticate requests
  var testUser = {
    id: 1,
    account: 'dvuyka',
    name: 'Denis Vuyka',
    pictureId: '00000000000000000000000000000000'
  };

  app.use(express.bodyParser());
  // make application always authenticated for test purposes
  app.use(function (req, res, next) {
    req.user = testUser;
    req.isAuthenticated = function() { return true; };
    next();
  });

  beforeEach(function () {
    context.data.getPublicProfile = function (callerId, targetAccount, callback) {
      if (targetAccount === 'johndoe') { callback(null, { id: 2 }); }
      else { callback(null, {}); }
    };
  });

  // raise 'app.init.routes' event for web.api to initialize routes
  context.emit(RuntimeEvents.app_init_routes, app);

  describe('getMentions: GET /api/mentions:topId?', function () {

    it('allows query without `topId`', function (done) {
      context.data.getMentions = function (callerId, account, topId, callback) {
        if (topId === 0) { callback(null, []); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/mentions')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getMentions = function (callerId, account, topId, callback) {
       callback(null, data);
      };

      request(app)
        .get('/api/mentions?topId=10')
        .expect('Content-Type', /json/)
        .expect(200, {feed: data}, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getMentions = function (caller, account, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/mentions?topId=10')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getMentions = function (caller, account, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/mentions?topId=10')
        .expect(400, done);
    });
  });

  describe('getPeople: GET /api/people:topId?', function () {

    it('allows query without `topId`', function (done) {
      context.data.getPeople = function (callerId, topId, callback) {
        if (topId === 0) { callback(null, []); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/people')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getPeople = function (callerId, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/people?topId=10')
        .expect('Content-Type', /json/)
        .expect(200, {feed:data}, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getPeople = function (callerId, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/people?topId=10')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getPeople = function (callerId, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/people?topId=10')
        .expect(400, done);
    });
  });

  describe('followAccount: GET /api/people/:account/follow', function () {

    it('follows account', function (done) {
      context.data.followAccount = function (callerId, targetAccount, callback) {
        callback(null);
      };

      request(app)
        .get('/api/people/johndoe/follow')
        .expect(200, done);
    });

    it('gets error from repository', function (done) {
      context.data.followAccount = function (callerId, targetAccount, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/people/johndoe/follow')
        .expect(400, done);
    });
  });

  describe('unfollowAccount: GET /api/people/:account/unfollow', function () {

    it('unfollows account', function (done) {
      context.data.unfollowAccount = function (callerId, targetAccount, callback) {
        callback(null);
      };

      request(app)
        .get('/api/people/johndoe/unfollow')
        .expect(200, done);
    });

    it('gets error from repository', function (done) {
      context.data.unfollowAccount = function (callerId, targetAccount, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/people/johndoe/unfollow')
        .expect(400, done);
    });
  });

  describe('getFollowers: GET /api/people/:account/followers:topId?', function () {

    it('gets error for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback('Error');
      };
      request(app)
        .get('/api/people/johndoe/followers')
        .expect(400, done);
    });

    it('gets no data for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback(null, null);
      };
      request(app)
        .get('/api/people/johndoe/followers')
        .expect(400, done);
    });

    it('allows query without `topId`', function (done) {
      context.data.getFollowers = function (callerId, targetId, callback) {
        callback(null, []);
      };

      request(app)
        .get('/api/people/johndoe/followers')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getFollowers = function (callerId, targetId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/people/johndoe/followers?topId=10')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });

    it('gets no data from repository', function (done) {
      context.data.getFollowers = function (callerId, targetId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/people/johndoe/followers?topId=10')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getFollowers = function (callerId, targetId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/people/johndoe/followers?topId=10')
        .expect(400, done);
    });

    it('gets data by account', function (done) {
      var data = [ { id: 1 } ];
      context.data.getFollowers = function (callerId, targetId, callback) {
        if (targetId === 2) { callback(null, data); }
        else { callback(null, null); }
      };

      request(app)
        .get('/api/people/johndoe/followers?topId=10')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });
  });

  describe('getFollowing: GET /api/people/:account/following:topId?', function () {

    it('gets error for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback('Error');
      };
      request(app)
        .get('/api/people/johndoe/following')
        .expect(400, done);
    });

    it('gets no data for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback(null, null);
      };
      request(app)
        .get('/api/people/johndoe/following')
        .expect(400, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getFollowing = function (callerId, targetId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/people/johndoe/following?topId=10')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });

    it('gets no data from repository', function (done) {
      context.data.getFollowing = function (callerId, targetId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/people/johndoe/following?topId=10')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getFollowing = function (callerId, targetId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/people/johndoe/following?topId=10')
        .expect(400, done);
    });

    it('gets data by account', function (done) {
      var data = [ { id: 1 } ];
      context.data.getFollowing = function (callerId, targetId, callback) {
        if (targetId === 2) { callback(null, data); }
        else { callback(null, null); }
      };

      request(app)
        .get('/api/people/johndoe/following?topId=10')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });
  });

  describe('getTimeline: GET /api/people/:account/timeline:topId?', function () {

    it('gets error for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback('Error');
      };
      request(app)
        .get('/api/people/johndoe/timeline')
        .expect(400, done);
    });

    it('gets no data for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback(null, null);
      };
      request(app)
        .get('/api/people/johndoe/timeline')
        .expect(400, done);
    });

    it('allows query without `topId`', function (done) {
      context.data.getTimeline = function (callerId, targetAccount, topId, callback) {
        if (topId === 0) { callback(null, []); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/people/johndoe/timeline')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getTimeline = function (callerId, targetAccount, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/people/johndoe/timeline')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });

    it('gets no data from repository', function (done) {
      context.data.getTimeline = function (callerId, targetAccount, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/people/johndoe/timeline')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getTimeline = function (callerId, targetAccount, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/people/johndoe/timeline')
        .expect(400, done);
    });

    it('gets data by account', function (done) {
      var data = [ { id: 1 } ];
      context.data.getTimeline = function (callerId, targetAccount, topId, callback) {
        if (targetAccount === 'johndoe') { callback(null, data); }
        else { callback(null, null); }
      };

      request(app)
        .get('/api/people/johndoe/timeline?topId=10')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });
  });

  describe('getPublicProfile: GET /api/accounts/:account/profile', function () {

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/accounts/johndoe/profile')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/accounts/johndoe/profile')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/accounts/johndoe/profile')
        .expect(400, done);
    });

    it('gets data by account', function (done) {
      var data = [ { id: 1 } ];
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        if (targetAccount === 'johndoe') { callback(null, data); }
        else { callback(null, null); }
      };

      request(app)
        .get('/api/accounts/johndoe/profile')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });
  });

  describe('addPost: POST /api/timeline/posts', function () {

    it('creates post', function (done) {
      context.data.addPost = function (json, callback) {
        callback(null, { id: 1 });
      };

      request(app)
        .post('/api/timeline/posts')
        .send({ content: 'hello world' })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          var post = res.body;
          post.id.should.equal(1);
          post.account.should.equal(testUser.account);
          post.content.should.equal('hello world');
          post.pictureId.should.equal(testUser.pictureId);
          post.commentsCount.should.equal(0);
          done();
        });
    });

    it('gets no data from repository', function (done) {
      context.data.addPost = function (json, callback) {
        callback(null, null);
      };

      request(app)
        .post('/api/timeline/posts')
        .send({ content: 'hello world' })
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.addPost = function (json, callback) {
        callback('Error');
      };

      request(app)
        .post('/api/timeline/posts')
        .send({ content: 'hello world' })
        .expect(400, done);
    });
  });

  describe('getMainTimeline: GET /api/timeline/posts:topId?', function () {

    it('allows query without `topId`', function (done) {
      context.data.getMainTimeline = function (userId, topId, callback) {
        if (topId === 0) { callback(null, []); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/timeline/posts')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function(done) {
      var data = [{id:1}];
      context.data.getMainTimeline = function (userId, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/timeline/posts')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getMainTimeline = function (userId, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/timeline/posts')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getMainTimeline = function (userId, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/timeline/posts')
        .expect(400, done);
    });
  });

  describe('deletePost: DELETE /api/timeline/posts/:id', function () {

    it('deletes post', function (done) {
      context.data.deletePost = function (postId, userId, callback) {
        callback(null, []);
      };

      request(app)
        .del('/api/timeline/posts/100')
        .expect(200, done);
    });

    it('gets no data from repository', function (done) {
      context.data.deletePost = function (postId, userId, callback) {
        callback(null, null);
      };

      request(app)
        .del('/api/timeline/posts/100')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.deletePost = function (postId, userId, callback) {
        callback('Error');
      };

      request(app)
        .del('/api/timeline/posts/100')
        .expect(400, done);
    });
  });

  describe('getTimelineUpdatesCount: GET /api/timeline/updates/count:topId?', function () {

    it('allows query without `topId`', function (done) {
      context.data.getTimelineUpdatesCount = function (userId, topId, callback) {
        if (topId === 0) { callback(null, []); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/timeline/updates/count')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getTimelineUpdatesCount = function (userId, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/timeline/updates/count')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getTimelineUpdatesCount = function (userId, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/timeline/updates/count')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getTimelineUpdatesCount = function (userId, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/timeline/updates/count')
        .expect(400, done);
    });
  });

  describe('getTimelineUpdates: GET /api/timeline/updates:topId?', function () {

    it('allows query without `topId`', function (done) {
      context.data.getTimelineUpdates = function (userId, topId, callback) {
        if (topId === 0) { callback(null, []); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/timeline/updates')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getTimelineUpdates = function (userId, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/timeline/updates')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getTimelineUpdates = function (userId, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/timeline/updates')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getTimelineUpdates = function (userId, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/timeline/updates')
        .expect(400, done);
    });
  });

  describe('addComment: POST /api/timeline/comments', function () {

    it('receives no content', function (done) {
      request(app)
        .post('/api/timeline/comments')
        .expect(400, done);
    });

    it('adds comment', function (done) {
      context.data.addComment = function (json, callback) {
        callback(null, { id: 1 });
      };

      var comment = {
        content: 'comment 1',
        postId: 1
      };

      request(app)
        .post('/api/timeline/comments')
        .send(comment)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          var result = res.body;
          result.userId.should.equal(testUser.id);
          result.postId.should.equal(comment.postId);
          result.content.should.equal(comment.content);
          result.id.should.equal(1);
          result.account.should.equal(testUser.account);
          result.name.should.equal(testUser.name);
          result.pictureId.should.equal(testUser.pictureId);
          done();
        });
    });

    it('gets no data from repository', function (done) {
      context.data.addComment = function (json, callback) {
        callback(null, null);
      };

      request(app)
        .post('/api/timeline/comments')
        .send({ id: 1, content: 'comment' })
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.addComment = function (json, callback) {
        callback('Error');
      };

      request(app)
        .post('/api/timeline/comments')
        .send({ id: 1, content: 'comment' })
        .expect(400, done);
    });
  });

  describe('getPostWithComments: GET /api/timeline/posts/:id', function () {

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getPostWithComments = function (postId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/timeline/posts/10')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getPostWithComments = function (postId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/timeline/posts/10')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getPostWithComments = function (postId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/timeline/posts/10')
        .expect(400, done);
    });
  });

  describe('getComments: GET /api/timeline/posts/:id/comments', function () {

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getComments = function (postId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/timeline/posts/10/comments')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getComments = function (postId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/timeline/posts/10/comments')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getComments = function (postId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/timeline/posts/10/comments')
        .expect(400, done);
    });
  });

  describe('getPostsByHashTag: GET /api/search?q={q}&src={src}&topId={topId}', function () {

    it('requires `query` and `source` parameters', function (done) {
      request(app)
        .get('/api/search')
        .expect(400, done);
    });

    it('allows query without `topId`', function (done) {
      context.data.getPostsByHashTag = function (callerId, hashtag, topId, callback) {
        if (topId === 0) { callback(null, []); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/search?q=test&src=hash')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getPostsByHashTag = function (callerId, hashtag, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/search?q=test&src=hash')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getPostsByHashTag = function (callerId, hashtag, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/search?q=test&src=hash')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getPostsByHashTag = function (callerId, hashtag, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/search?q=test&src=hash')
        .expect(400, done);
    });
  });
});