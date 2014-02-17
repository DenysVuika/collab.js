/*
Simple test to check mandatory API availability
 */
'use strict';

var data = require('../data')
  , expect = require('expect.js');

describe('collab.js data layer', function () {

  // ensure required minimum of API is available
  describe('api implementation check', function () {

    it('.SessionStore', function () {
      expect(data.SessionStore).to.be.a('function');
    });

    it('.setProvider', function () {
      expect(data.setProvider).to.be.a('function');
    });

    it('.getAccountById', function () {
      expect(data.getAccountById).to.be.a('function');
    });

    it('.getAccount', function () {
      expect(data.getAccount).to.be.a('function');
    });

    it('.createAccount', function () {
      expect(data.createAccount).to.be.a('function');
    });

    it('.updateAccount', function () {
      expect(data.updateAccount).to.be.a('function');
    });

    it('.setAccountPassword', function () {
      expect(data.setAccountPassword).to.be.a('function');
    });

    it('.getPublicProfile', function () {
      expect(data.getPublicProfile).to.be.a('function');
    });

    it('.followAccount', function () {
      expect(data.followAccount).to.be.a('function');
    });

    it('.unfollowAccount', function () {
      expect(data.unfollowAccount).to.be.a('function');
    });

    it('.getPeople', function () {
      expect(data.getPeople).to.be.a('function');
    });

    it('.getFollowers', function () {
      expect(data.getFollowers).to.be.a('function');
    });

    it('.getFollowing', function () {
      expect(data.getFollowing).to.be.a('function');
    });

    it('.addPost', function () {
      expect(data.addPost).to.be.a('function');
    });

    it('.deleteNewsPost', function () {
      expect(data.deleteNewsPost).to.be.a('function');
    });

    it('.deleteWallPost', function () {
      expect(data.deleteWallPost).to.be.a('function');
    });

    it('.getWall', function () {
      expect(data.getWall).to.be.a('function');
    });

    it('.getNews', function () {
      expect(data.getNews).to.be.a('function');
    });

    it('.getPost', function () {
      expect(data.getPost).to.be.a('function');
    });

    it('.checkNewsUpdates', function () {
      expect(data.checkNewsUpdates).to.be.a('function');
    });

    it('.getNewsUpdates', function () {
      expect(data.getNewsUpdates).to.be.a('function');
    });

    it('.getPostsByHashTag', function () {
      expect(data.getPostsByHashTag).to.be.a('function');
    });

    it('.addComment', function () {
      expect(data.addComment).to.be.a('function');
    });

    it('.getComments', function () {
      expect(data.getComments).to.be.a('function');
    });
  });
});