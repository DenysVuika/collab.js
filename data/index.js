'use strict';

var config = require('../config')
	, Provider = require('./providers/' + config.data.provider);

// Notes:
// it is possible to just promote underlying provider like following:
// module.exports = new Provider()
// however the approach below allows defining contracts for data providers
// and in addition lists APIs required to be be supported 
// by every provider implementation

var provider = new Provider();

/**
 * Overrides current provider value with new instance.
 * @param instance New provider instance.
 */
module.exports.setProvider = function (instance) {
  provider = instance;
};

/**
 * Returns account by id.
 * @param id Account id.
 * @param {function(err, user)} callback Callback function.
 */
module.exports.getAccountById = function (id, callback) {
	provider.getAccountById(id, callback);
};

module.exports.getAccount = function (account, callback) {
	provider.getAccount(account, callback);
};

module.exports.createAccount = function (json, callback) {
	provider.createAccount(json, callback);
};

module.exports.updateAccount = function (id, json, callback) {
	provider.updateAccount(id, json, callback);
};

module.exports.setAccountPassword = function (userId, password, callback) {
  provider.setAccountPassword(userId, password, callback);
};

module.exports.getPublicProfile = function (callerAccount, targetAccount, callback) {
	provider.getPublicProfile(callerAccount, targetAccount, callback);
};

module.exports.followAccount = function (callerId, targetAccount, callback) {
	provider.followAccount(callerId, targetAccount, callback);
};

module.exports.unfollowAccount = function (callerId, targetAccount, callback) {
	provider.unfollowAccount(callerId, targetAccount, callback);
};

module.exports.getMentions = function (callerId, account, topId, callback) {
	provider.getMentions(callerId, account, topId, callback);
};

module.exports.getPeople = function (callerId, topId, callback) {
	provider.getPeople(callerId, topId, callback);
};

module.exports.getFollowers = function (callerId, targetAccount, topId, callback) {
	provider.getFollowers(callerId, targetAccount, topId, callback);
};

module.exports.getFollowing = function (callerId, targetAccount, topId, callback) {
	provider.getFollowing(callerId, targetAccount, topId, callback);
};

module.exports.getTimeline = function (callerId, targetAccount, topId, callback) {
	provider.getTimeline(callerId, targetAccount, topId, callback);
};

module.exports.addPost = function (json, callback) {
	provider.addPost(json, callback);
};

module.exports.getMainTimeline = function (userId, topId, callback) {
	provider.getMainTimeline(userId, topId, callback);
};

module.exports.deletePost = function (postId, userId, callback) {
  provider.deletePost(postId, userId, callback);
};

module.exports.getTimelineUpdatesCount = function (userId, topId, callback) {
	provider.getTimelineUpdatesCount(userId, topId, callback);
};

module.exports.getTimelineUpdates = function (userId, topId, callback) {
	provider.getTimelineUpdates(userId, topId, callback);
};

module.exports.getPostsByHashTag = function (callerId, hashtag, topId, callback) {
  provider.getPostsByHashTag(callerId, hashtag, topId, callback);
};

module.exports.addComment = function (json, callback) {
	provider.addComment(json, callback);
};

module.exports.getPostWithComments = function (postId, callback) {
	provider.getPostWithComments(postId, callback);
};

module.exports.getComments = function (postId, callback) {
	provider.getComments(postId, callback);
};

module.exports.getPostAuthor = function (postId, callback) {
	provider.getPostAuthor(postId, callback);
};