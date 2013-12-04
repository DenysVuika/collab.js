/* global describe, it */
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

    it('.getMentions', function () {
      expect(data.getMentions).to.be.a('function');
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

    it('.getTimeline', function () {
      expect(data.getTimeline).to.be.a('function');
    });

    it('.addPost', function () {
      expect(data.addPost).to.be.a('function');
    });

    it('.getMainTimeline', function () {
      expect(data.getMainTimeline).to.be.a('function');
    });

    it('.deletePost', function () {
      expect(data.deletePost).to.be.a('function');
    });

    it('.getTimelineUpdatesCount', function () {
      expect(data.getTimelineUpdatesCount).to.be.a('function');
    });

    it('.getTimelineUpdates', function () {
      expect(data.getTimelineUpdates).to.be.a('function');
    });

    it('.getPostsByHashTag', function () {
      expect(data.getPostsByHashTag).to.be.a('function');
    });

    it('.addComment', function () {
      expect(data.addComment).to.be.a('function');
    });

    it('.getPostWithComments', function () {
      expect(data.getPostWithComments).to.be.a('function');
    });

    it('.getComments', function () {
      expect(data.getComments).to.be.a('function');
    });

    it('.getPostAuthor', function () {
      expect(data.getPostAuthor).to.be.a('function');
    });

    it('.addSavedSearch', function () {
      expect(data.addSavedSearch).to.be.a('function');
    });

    it('.getSavedSearches', function () {
      expect(data.getSavedSearches).to.be.a('function');
    });

    it('.deleteSavedSearch', function () {
      expect(data.deleteSavedSearch).to.be.a('function');
    });

    it('.hasSavedSearch', function () {
      expect(data.hasSavedSearch).to.be.a('function');
    });
  });
});