'use strict';

var config = require('../../config')
  , pool = require('./collabjs.pool.mysql').pool
  , passwordHash = require('password-hash')
  , crypto = require('crypto');

function Provider() {}

Provider.prototype = {
  getAccountById: function (id, callback) {
    var command = 'CALL get_account_by_id(?)'
      , params = [id];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { return callback(err, null); }
        var rows = result[0];
        if (rows.length > 0) { return callback(err, rows[0]); }
        else { return callback(err, null); }
      });
    });
  },
  getAccount: function (account, callback) {
    var command = 'CALL get_account(?)'
      , params = [account];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { return callback(err, null); }
        var rows = result[0];
        if (rows.length > 0) { return callback(err, rows[0]); }
        else { return callback(err, null); }
      });
    });
  },
  createAccount: function (json, callback) {
    json.emailHash = crypto.createHash('md5').update(json.email.trim().toLowerCase()).digest('hex');
    pool.getConnection(function (err, connection) {
      connection.query('INSERT INTO users SET ?', json, function (err, result) {
        connection.release();
        if (err) {
          var errorMessage = 'Error creating account.';
          if (err.code === 'ER_DUP_ENTRY') {
            errorMessage = 'User with such account already exists.';
          }
          callback(errorMessage);
        } else {
          callback(null, { id: result.insertId });
        }
      });
    });
  },
  updateAccount: function (id, json, callback) {
    var fields = {};
    // update user.name
    if (json.name && json.name.length > 0) {
      fields.name = json.name;
    }
    // update or reset user.location
    fields.location = json.location ? json.location : '';
    // update or reset user.website
    fields.website = json.website ? json.website : '';
    // update or reset user.bio
    fields.bio = json.bio ? json.bio : '';

    pool.getConnection(function (err, connection) {
      connection.query('UPDATE users SET ? WHERE id = ' + connection.escape(id), fields, function (err, result) {
        connection.release();
        callback(err, result);
      });
    });
  },
  setAccountPassword: function (userId, password, callback) {
    if (!userId || !password || password.length === 0) {
      callback('Error setting account password.', null);
    } else {
      this.getAccountById(userId, function (err, result) {
        if (err) { callback(err, result); }
        else {
          var hashedPassword = passwordHash.generate(password)
            , command = 'UPDATE users SET password = ? WHERE id = ?'
            , params = [hashedPassword, userId];
          pool.getConnection(function (err, connection) {
            connection.query(command, params, function (err, result) {
              connection.release();
              if (err) { callback(err, result); }
              else { callback(null, hashedPassword); }
            });
          });
        }
      });
    }
  },
  getPublicProfile: function (callerAccount, targetAccount, callback) {
    var command = 'CALL get_public_profile(?,?)'
      , params = [callerAccount, targetAccount];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err || !result || result.length !== 2 || result[0].length === 0) {
          callback(err, null);
        } else {
          var rows = result[0];
          callback(err, rows[0]);
        }
      });
    });
  },
  followAccount: function (callerId, targetAccount, callback) {
    var command = 'CALL subscribe_account(?,?)'
      , params = [callerId, targetAccount];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        callback(err, result);
      });
    });
  },
  unfollowAccount: function (callerId, targetAccount, callback) {
    var command = 'CALL unsubscribe_account(?,?)'
      , params = [callerId, targetAccount];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        callback(err, result);
      });
    });
  },
  getMentions: function (callerId, account, topId, callback) {
    var command = 'CALL get_mentions(?,?,?)'
      , params = [callerId, account, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  getPeople: function (callerId, topId, callback) {
    var command = 'CALL get_people(?,?)'
      , params = [callerId, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  getFollowers: function (callerId, targetAccount, topId, callback) {
    var command = 'CALL get_followers(?,?,?)'
      , params = [callerId, targetAccount, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  getFollowing: function (callerId, targetAccount, topId, callback) {
    var command = 'CALL get_following(?,?,?)';
    var params = [callerId, targetAccount, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  getTimeline: function (callerId, targetAccount, topId, callback) {
    var command = 'CALL get_timeline(?,?,?)'
      , params = [callerId, targetAccount, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  addPost: function (json, callback) {
    var command = 'CALL add_post(?,?,?)'
      , params = [json.userId, json.content, json.created];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows[0]);
        }
      });
    });
  },
  getMainTimeline: function (userId, topId, callback) {
    var command = 'CALL get_main_timeline(?, ?)'
      , params = [userId, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  deletePost: function (postId, userId, callback) {
    var command = 'CALL delete_post (?,?)'
      , params = [userId, postId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err || !result) { callback(err, false); }
        else { callback(err, true); }
      });
    });
  },
  getTimelineUpdatesCount: function (userId, topId, callback) {
    var command = 'CALL get_timeline_updates_count(?,?)'
      , params = [userId, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var row = result[0];
          callback(err, row[0]);
        }
      });
    });
  },
  getTimelineUpdates: function (userId, topId, callback) {
    var command = 'CALL get_timeline_updates(?,?)'
      , params = [userId, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  getPostsByHashTag: function (callerId, hashtag, topId, callback) {
    var tag = hashtag;
    if (tag.indexOf('#') !== 0) {
      tag = '#' + tag;
    }
    var command = 'CALL get_posts_by_hashtag(?,?,?)'
      , params = [callerId, tag, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  addComment: function (json, callback) {
    var command = 'CALL add_comment (?,?,?,?)'
      , params = [json.userId, json.postId, json.created, json.content];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else { callback(err, { id: result.insertId }); }
      });
    });
  },
  getPostWithComments: function (postId, callback) {
    var command = 'CALL get_post_full(?)'
      , params = [postId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          if (!rows || rows.length === 0 || !rows[0] || rows[0].length === 0) {
            callback(err, null);
          } else {
            var post = rows[0];
            if (result[1] && result[1].length > 0) {
              post.commentsCount = result[1].length;
              post.comments = result[1];
            } else {
              post.commentsCount = 0;
              post.comments = [];
            }
            callback(err, post);
          }
        }
      });
    });
  },
  getComments: function (postId, callback) {
    var command = 'CALL get_comments(?)'
      , params = [postId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          callback(err, rows);
        }
      });
    });
  },
  getPostAuthor: function (postId, callback) {
    var command = 'CALL get_post_author(?)'
      , params = [postId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { return callback(err, null); }
        else {
          var rows = result[0];
          if (!rows || rows.length === 0) {
            return callback(err, null);
          }
          return callback(err, rows[0]);
        }
      });
    });
  },
  getSavedSearches: function (userId, callback) {
    var command = 'CALL get_search_lists(?)'
      , params = [userId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else { callback(null, result[0]); }
      });
    });
  },
  addSavedSearch: function (json, callback) {
    var command = 'CALL add_search_list(?,?,?,?)'
      , params = [json.name, json.userId, json.q, json.src];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err) {
        connection.release();
        if (err) { callback(err); }
        else { callback(false); }
      });
    });
  },
  deleteSavedSearch: function (userId, name, callback) {
    var command = 'CALL delete_search_list(?,?)'
      , params = [userId, name];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err) {
        connection.release();
        if (err) { callback(err); }
        else { callback(false); }
      });
    });
  }
};

module.exports = Provider;