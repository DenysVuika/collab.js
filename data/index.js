'use strict';

var config = require('../config')
	, Provider = require('./providers/' + config.data.provider)
  , express = require('express')
  , SessionStore = require('./providers/' + config.data.sessionStore)(express);

module.exports.SessionStore = SessionStore;

// Notes:
// it is possible to just promote underlying provider like following:
// module.exports = new Provider()
// however the approach below allows defining contracts for data providers
// and in addition lists APIs required to be be supported 
// by every provider implementation

var provider = new Provider();

/**
 * Overrides current provider value with new instance.
 * @param {object} instance New provider instance.
 */
module.exports.setProvider = function (instance) {
  provider = instance;
};

/**
 * Get account by id.
 * @param {number} id Account id.
 * @param {function(err, user)} callback Callback function.
 */
module.exports.getAccountById = function (id, callback) {
	provider.getAccountById(id, callback);
};

/**
 * Get account by name.
 * @param {string} account Account name.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getAccount = function (account, callback) {
	provider.getAccount(account, callback);
};

/**
 * Create new user account.
 *
 * This function requires at least the following parameters (passed as a json object):
 * - account (user account name)
 * - name (user public name)
 * - password (user password)
 * - email (user email)
 *
 * @param {Object} json Parameters as json object.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.createAccount = function (json, callback) {
	provider.createAccount(json, callback);
};

/**
 * Update account details for the specific user.
 *
 * This function requires at least one of the following parameters (passed as a json object):
 * - name (user public name)
 * - location (user geographic location)
 * - website (user website or blog address)
 * - bio (short user bio or about information)
 *
 * @param {number} id User account id.
 * @param {Object} json Parameters as json object.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.updateAccount = function (id, json, callback) {
	provider.updateAccount(id, json, callback);
};

/**
 * Set new password for the user account.
 * @param {number} userId User id.
 * @param {string} password New password.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.setAccountPassword = function (userId, password, callback) {
  provider.setAccountPassword(userId, password, callback);
};

/**
 * Get public profile.
 * @param {string} callerAccount Originator account name.
 * @param {string} targetAccount Target account name.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getPublicProfile = function (callerAccount, targetAccount, callback) {
	provider.getPublicProfile(callerAccount, targetAccount, callback);
};

/**
 * Follow (subscribe) user account.
 * @param {number} callerId Originator account id.
 * @param {string} targetAccount Target account name.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.followAccount = function (callerId, targetAccount, callback) {
	provider.followAccount(callerId, targetAccount, callback);
};

/**
 * Unfollow (unsubscribe) user account.
 * @param {number} callerId Originator account id.
 * @param {string} targetAccount Target account name.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.unfollowAccount = function (callerId, targetAccount, callback) {
	provider.unfollowAccount(callerId, targetAccount, callback);
};

/**
 * Get a list of registered people for the given user id.
 * @param {number} callerId Originator account id.
 * @param {number} topId Position of the first entry from the top (used for paging).
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getPeople = function (callerId, topId, callback) {
	provider.getPeople(callerId, topId, callback);
};

/**
 * Get a list of followers (subscribers) for the given account name.
 * @param {number} callerId Originator account id.
 * @param {string} targetId Target account id.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getFollowers = function (callerId, targetId, callback) {
	provider.getFollowers(callerId, targetId, callback);
};

/**
 * Get a list of people being followed (subscribed) by the given account id.
 * @param {number} callerId Originator account id.
 * @param {string} targetId Target account id.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getFollowing = function (callerId, targetId, callback) {
	provider.getFollowing(callerId, targetId, callback);
};

/**
 * Get personal wall feed for the given account name.
 * @param {number} userId Target account id.
 * @param {number} topId Position of the first entry from the top (used for paging).
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getWall = function (userId, topId, callback) {
  provider.getWall(userId, topId, callback);
};

/**
 * Create a new user post.
 *
 * This function requires at least one of the following parameters (passed as a json object):
 * - userId (user account id)
 * - content (post content)
 * - created (post creation date and time)
 *
 * @param {Object} json Parameters as json object.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.addPost = function (json, callback) {
	provider.addPost(json, callback);
};

/**
 * Get News feed for the given account id.
 * @param {number} userId User account id.
 * @param {number} topId Position of the first entry from the top (used for paging).
 * @param {function(err, callback)} callback Callback function.
 */
module.exports.getNews = function (userId, topId, callback) {
  provider.getNews(userId, topId, callback);
};

/**
 * Delete (mute) post from News.
 * @param {number} userId User account id.
 * @param {number} postId Post id.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.deleteNewsPost = function (userId, postId, callback) {
  provider.deleteNewsPost(userId, postId, callback);
};

/**
 * Delete post from personal Wall, News and followers' News.
 * @param {number} userId User account id.
 * @param {number} postId Post id.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.deleteWallPost = function (userId, postId, callback) {
  provider.deleteWallPost(userId, postId, callback);
};

/**
 * Get number of new posts that have appeared since last news fetch.
 * @param {number} userId User account id.
 * @param {number} topId Position of the first entry from the top (used for paging).
 * @param {function(err, result)} callback Callback function.
 */
module.exports.checkNewsUpdates = function (userId, topId, callback) {
  provider.checkNewsUpdates(userId, topId, callback);
};

/**
 * Get posts that have appeared since last news fetch.
 * @param {number} userId User account id.
 * @param {number} topId Position of the first entry from the top (used for paging).
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getNewsUpdates = function (userId, topId, callback) {
  provider.getNewsUpdates(userId, topId, callback);
};

/**
 * Get all posts containing given hash tag in their content.
 * @param {number} callerId Originator account id.
 * @param {string} hashtag Hash tag to search.
 * @param {number} topId Position of the first entry from the top (used for paging).
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getPostsByHashTag = function (callerId, hashtag, topId, callback) {
  provider.getPostsByHashTag(callerId, hashtag, topId, callback);
};

/**
 * Add new comment for the existing post.
 *
 * This function requires at least the following parameters (passed as a json object):
 * - userId (user account id)
 * - postId (post id)
 * - created (comment creation date and time)
 * - content (comment content)
 *
 * @param json Parameters as json object.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.addComment = function (json, callback) {
	provider.addComment(json, callback);
};

/**
 * Get specific post with list of comments.
 * @param {number} postId Post id.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getPostWithComments = function (postId, callback) {
	provider.getPostWithComments(postId, callback);
};

/**
 * Get comments for the specific post.
 * @param {number} postId Post id.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getComments = function (postId, callback) {
	provider.getComments(postId, callback);
};

/**
 * Get user information based on the post.
 * @param {number} postId Post id.
 * @param {function(err, result)} callback Callback function.
 */
module.exports.getPostAuthor = function (postId, callback) {
	provider.getPostAuthor(postId, callback);
};