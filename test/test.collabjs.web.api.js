'use strict';

var express = require('express')
  , request = require('supertest')
  , expect = require('expect.js')
  , runtime = require('../collabjs.runtime')
  , RuntimeEvents = runtime.RuntimeEvents;

describe('collab.js web.api', function () {

  var app = express()
    , context = runtime.RuntimeContext
    , webApi = require('../collabjs.web.api')(context);

  // user to authenticate requests
  var testUser = {
    id: 1,
    account: 'dvuyka',
    name: 'Denis Vuyka',
    pictureId: '00000000000000000000000000000000'
  };

  app.use(express.json());
  app.use(express.urlencoded());
  // make application always authenticated for test purposes
  app.use(function (req, res, next) {
    req.user = testUser;
    req.isAuthenticated = function() { return true; };
    res.locals({ hasSavedSearch: function () { return true; }});
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
        .expect(200, data, done);
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

  describe('followAccount: GET /api/u/:account/follow', function () {

    it('follows account', function (done) {
      context.data.followAccount = function (callerId, targetAccount, callback) {
        callback(null);
      };

      request(app)
        .post('/api/u/johndoe/follow')
        .expect(200, done);
    });

    it('gets error from repository', function (done) {
      context.data.followAccount = function (callerId, targetAccount, callback) {
        callback('Error');
      };

      request(app)
        .post('/api/u/johndoe/follow')
        .expect(400, done);
    });
  });

  describe('unfollowAccount: GET /api/u/:account/unfollow', function () {

    it('unfollows account', function (done) {
      context.data.unfollowAccount = function (callerId, targetAccount, callback) {
        callback(null);
      };

      request(app)
        .post('/api/u/johndoe/unfollow')
        .expect(200, done);
    });

    it('gets error from repository', function (done) {
      context.data.unfollowAccount = function (callerId, targetAccount, callback) {
        callback('Error');
      };

      request(app)
        .post('/api/u/johndoe/unfollow')
        .expect(400, done);
    });
  });

  describe('getFollowers: GET /api/u/:account/followers', function () {

    it('gets error for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback('Error');
      };
      request(app)
        .get('/api/u/johndoe/followers')
        .expect(400, done);
    });

    it('gets no data for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback(null, null);
      };
      request(app)
        .get('/api/u/johndoe/followers')
        .expect(400, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getFollowers = function (callerId, targetId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/u/johndoe/followers')
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
        .get('/api/u/johndoe/followers')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getFollowers = function (callerId, targetId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/u/johndoe/followers')
        .expect(400, done);
    });

    it('gets data by account', function (done) {
      var data = [ { id: 1 } ];
      context.data.getFollowers = function (callerId, targetId, callback) {
        if (targetId === 2) { callback(null, data); }
        else { callback(null, null); }
      };

      request(app)
        .get('/api/u/johndoe/followers')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });
  });

  describe('getFollowing: GET /api/u/:account/following', function () {

    it('gets error for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback('Error');
      };
      request(app)
        .get('/api/u/johndoe/following')
        .expect(400, done);
    });

    it('gets no data for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback(null, null);
      };
      request(app)
        .get('/api/u/johndoe/following')
        .expect(400, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getFollowing = function (callerId, targetId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/u/johndoe/following')
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
        .get('/api/u/johndoe/following')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getFollowing = function (callerId, targetId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/u/johndoe/following')
        .expect(400, done);
    });

    it('gets data by account', function (done) {
      var data = [ { id: 1 } ];
      context.data.getFollowing = function (callerId, targetId, callback) {
        if (targetId === 2) { callback(null, data); }
        else { callback(null, null); }
      };

      request(app)
        .get('/api/u/johndoe/following')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });
  });

  describe('getWall: GET /api/u/:account/posts:topId?', function () {

    it('gets error for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback('Error');
      };
      request(app)
        .get('/api/u/johndoe/posts')
        .expect(400, done);
    });

    it('gets no data for profile', function (done) {
      context.data.getPublicProfile = function (callerId, targetAccount, callback) {
        callback(null, null);
      };
      request(app)
        .get('/api/u/johndoe/posts')
        .expect(400, done);
    });

    it('allows query without `topId`', function (done) {
      context.data.getWall = function (userId, topId, callback) {
        if (topId === 0) { callback(null, []); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/u/johndoe/posts')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getWall = function (userId, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/u/johndoe/posts')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(res.body.feed).to.eql(data);
          done();
        });
    });

    it('gets no data from repository', function (done) {
      context.data.getWall = function (userId, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/u/johndoe/posts')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getWall = function (userId, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/u/johndoe/posts')
        .expect(400, done);
    });
  });

  describe('addPost: POST /api/u/posts', function () {

    it('creates post', function (done) {
      context.data.addPost = function (json, callback) {
        callback(null, 1);
      };

      request(app)
        .post('/api/u/posts')
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
        .post('/api/u/posts')
        .send({ content: 'hello world' })
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.addPost = function (json, callback) {
        callback('Error');
      };

      request(app)
        .post('/api/u/posts')
        .send({ content: 'hello world' })
        .expect(400, done);
    });
  });

  describe('getNews: GET /api/news', function () {

    it('gets data from repository', function(done) {
      var data = [{id:1}];
      context.data.getNews = function (userId, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/news')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getNews = function (userId, topId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/news')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getNews = function (userId, topId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/news')
        .expect(400, done);
    });
  });

  describe('addComment: POST /api/posts/:id/comments', function () {

    it('receives no content', function (done) {
      request(app)
        .post('/api/posts/1/comments')
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
        .post('/api/posts/1/comments')
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
        .post('/api/posts/1/comments')
        .send({ id: 1, content: 'comment' })
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.addComment = function (json, callback) {
        callback('Error');
      };

      request(app)
        .post('/api/posts/1/comments')
        .send({ id: 1, content: 'comment' })
        .expect(400, done);
    });
  });

  describe('getPost: GET /api/posts/:id', function () {

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getPost = function (postId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/posts/10')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getPost = function (postId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/posts/10')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getPost = function (postId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/posts/10')
        .expect(400, done);
    });
  });

  describe('getComments: GET /api/posts/:id/comments', function () {

    it('gets data from repository', function (done) {
      var data = [{id:1}];
      context.data.getComments = function (postId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/posts/10/comments')
        .expect('Content-Type', /json/)
        .expect(200, data, done);
    });

    it('gets no data from repository', function (done) {
      context.data.getComments = function (postId, callback) {
        callback(null, null);
      };

      request(app)
        .get('/api/posts/10/comments')
        .expect(400, done);
    });

    it('gets error from repository', function (done) {
      context.data.getComments = function (postId, callback) {
        callback('Error');
      };

      request(app)
        .get('/api/posts/10/comments')
        .expect(400, done);
    });
  });

  /*describe('getPostsByHashTag: GET /api/search?q={q}&src={src}&topId={topId}', function () {

    it('requires `query` and `source` parameters', function (done) {
      request(app)
        .get('/api/search')
        .expect(400, done);
    });

    it('allows query without `topId`', function (done) {

      context.data.hasSavedSearch = function (userId, name, callback) {
        callback(true);
      };

      context.data.getPostsByHashTag = function (callerId, hashtag, topId, callback) {
        if (topId === 0) { callback(null, { entries: []}); }
        else { callback('Error'); }
      };

      request(app)
        .get('/api/search?q=test&src=hash')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('gets data from repository', function (done) {
      var data = [{id:1}];

      context.data.hasSavedSearch = function (userId, name, callback) {
        callback(null, true);
      };

      context.data.getPostsByHashTag = function (callerId, hashtag, topId, callback) {
        callback(null, data);
      };

      request(app)
        .get('/api/search?q=test&src=hash')
        .expect('Content-Type', /json/)
        .expect(200, { isSaved: true, entries: data }, done);
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
  });*/
});