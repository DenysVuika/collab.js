'use strict';

var utils = require('../../collabjs.utils')
  , pool = require('./collabjs.pool.mysql').pool
  , passwordHash = require('password-hash')
  , crypto = require('crypto');

/**
 * Creates mentions for the given post.
 * @param {object} connection Database connection.
 * @param {number} postId Post id.
 * @param {string} content Post content.
 * @param {function(object)} callback Callback function.
 */
function addMentions(connection, postId, content, callback) {
  var accounts = utils.parseAccountNames(content, ',');
  if (accounts) {
    connection.query('CALL add_mentions (?,?)', [postId, accounts], function (err) {
      callback(err);
    });
  } else {
    callback(false);
  }
}

/**
 * Adds or creates hash tags for the given post.
 * @param {Object} connection Database connection.
 * @param {number} postId Post id.
 * @param {string} content Post content.
 * @param {function(object)} callback Callback function.
 */
function addHashTags(connection, postId, content, callback) {
  var tags = utils.parseHashTags(content, ',');
  if (tags) {
    connection.query('CALL assign_tags (?,?)', [postId, tags], function (err) {
      callback(err);
    });
  } else {
    callback(false);
  }
}

/**
 * MySQL provider implementation.
 * @constructor
 */
function Provider() {}

Provider.prototype = {
  // TODO: review
  getAccountById: function (id, callback) {
    pool.getConnection(function (err, connection) {
      var command = "SELECT u.*, emailHash as pictureId, GROUP_CONCAT(r.loweredName separator ',') AS roles " +
        "FROM users AS u " +
        "LEFT JOIN user_roles AS ur on ur.userId = u.id " +
        "LEFT JOIN roles AS r ON r.id = ur.roleId " +
        "WHERE u.id = ? GROUP BY u.id LIMIT 1";
      connection.query(command, [id], function (err, result) {
        connection.release();
        if (err) { return callback(err, null); }
        if (result.length > 0) {
          result[0].pictureUrl = utils.getAvatarUrl(result[0].pictureId);
          return callback(err, result[0]);
        }
        else { return callback(err, null); }
      });
    });
  },
  // TODO: review
  getAccount: function (account, callback) {
    pool.getConnection(function (err, connection) {
      var command = "SELECT u.*, emailHash as pictureId, GROUP_CONCAT(r.loweredName separator ',') AS roles " +
        "FROM users AS u " +
        "LEFT JOIN user_roles AS ur on ur.userId = u.id " +
        "LEFT JOIN roles AS r ON r.id = ur.roleId " +
        "WHERE u.account = ? GROUP BY u.id LIMIT 1";
      connection.query(command, [account], function (err, result) {
        connection.release();
        if (err) { return callback(err, null); }
        if (result.length > 0) {
          result[0].pictureUrl = utils.getAvatarUrl(result[0].pictureId);
          return callback(err, result[0]);
        }
        else { return callback(err, null); }
      });
    });
  },
  createAccount: function (json, callback) {
    pool.getConnection(function (err, connection) {
      json.emailHash = crypto.createHash('md5').update(json.email.trim().toLowerCase()).digest('hex');
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
    var fields = {
      location: json.location || '',                  // update or reset user.location
      website: utils.addHttp(json.website || ''),     // update or reset user.website
      bio: json.bio || ''                             // update or reset user.bio
    };

    // update user.name
    if (json.name && json.name.length > 0) {
      fields.name = json.name;
    }

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
            , command = 'UPDATE users SET password = ? WHERE id = ?';
          pool.getConnection(function (err, connection) {
            connection.query(command, [hashedPassword, userId], function (err, result) {
              connection.release();
              if (err) { callback(err, result); }
              else { callback(null, hashedPassword); }
            });
          });
        }
      });
    }
  },
  // TODO: review
  getPublicProfile: function (callerId, targetAccount, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'SELECT u.id, u.account, u.name, u.website, u.bio, u.emailHash AS pictureId, u.location, u.posts, u.following, u.followers, ' +
        '(SELECT IF(u.id = ?, TRUE, FALSE)) AS isOwnProfile, ' +
        '(SELECT IF ((SELECT COUNT(userId) FROM `following` AS f WHERE f.userId = ? AND f.targetId = u.id LIMIT 1) > 0, TRUE, FALSE)) AS isFollowed ' +
        'FROM users AS u ' +
        'WHERE u.account = ? LIMIT 1';
      connection.query(command, [callerId, callerId, targetAccount], function (err, result) {
        connection.release();
        if (err || result.length === 0) { callback(err, null); }
        else {
          var profile = result[0];
          profile.pictureUrl = utils.getAvatarUrl(profile.pictureId);
          callback(err, profile);
        }
      });
    });
  },
  followAccount: function (callerId, targetAccount, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL subscribe_account(?,?)';
      connection.query(command, [callerId, targetAccount], function (err, result) {
        connection.release();
        callback(err, result);
      });
    });
  },
  unfollowAccount: function (callerId, targetAccount, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL unsubscribe_account(?,?)';
      connection.query(command, [callerId, targetAccount], function (err, result) {
        connection.release();
        callback(err, result);
      });
    });
  },
  getPeople: function (callerId, topId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL get_people(?,?)';
      connection.query(command, [callerId, topId], function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureId = utils.getAvatarUrl(rows[i].pictureId);
            }
          }
          callback(err, rows);
        }
      });
    });
  },
  // TODO: review
  getFollowers: function (callerId, targetId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'SELECT u.id, u.account, u.name, u.website, u.location, u.bio, u.emailHash as pictureId, u.posts, u.following, u.followers' +
        ', (SELECT IF(u.id = ?, TRUE, FALSE)) AS isOwnProfile ' +
        ', (SELECT IF ((SELECT COUNT(sub.userId) FROM following AS sub WHERE sub.userId = ? AND sub.targetId = u.id) > 0, TRUE, FALSE )) AS isFollowed ' +
        'FROM following AS f ' +
        'LEFT JOIN users AS u ON u.id = f.userId ' +
        'WHERE f.targetId = ?';
      connection.query(command, [callerId, callerId, targetId], function (err, result) {
        connection.release();
        // init picture urls
        if (result.length > 0) {
          for (var i = 0; i < result.length; i++) {
            result[i].pictureUrl = utils.getAvatarUrl(result[i].pictureId);
          }
        }
        callback(err, result);
      });
    });
  },
  // TODO: review
  getFollowing: function (callerId, targetId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'SELECT u.id, u.account, u.name, u.website, u.location, u.bio, u.emailHash as pictureId, u.posts, u.following, u.followers' +
        ', (SELECT IF(u.id = ?, TRUE, FALSE)) AS isOwnProfile' +
        ', (SELECT IF ((SELECT COUNT(sub.userId) FROM following AS sub WHERE sub.userId = ? AND sub.targetId = u.id) > 0, TRUE, FALSE)) AS isFollowed ' +
        'FROM following AS f ' +
        'LEFT JOIN users AS u ON u.id = f.targetId ' +
        'WHERE f.userId = ?';
      connection.query(command, [callerId, callerId, targetId], function (err, result) {
        connection.release();
        // init picture urls
        if (result.length > 0) {
          for (var i = 0; i < result.length; i++) {
            result[i].pictureUrl = utils.getAvatarUrl(result[i].pictureId);
          }
        }
        callback(err, result);
      });
    });
  },
  getWall: function (userId, topId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL get_wall(?,?)'
        , params = [userId, topId];
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = utils.getAvatarUrl(rows[i].pictureId);
            }
          }
          callback(err, rows);
        }
      });
    });
  },
  addPost: function (json, callback) {
    pool.getConnection(function (err, connection) {
      var params = [json.userId, json.content, json.created];
      connection.query('CALL add_post (?,?,?)', params, function (err, result) {
        if (err) {
          connection.release();
          callback(err, null);
        }
        else {
          var rows = result[0];
          var postId = rows[0].insertId;

          if (postId && postId > 0) {
            // process mentions
            addMentions(connection, postId, json.content, function () {
              // process hashtags
              addHashTags(connection, postId, json.content, function () {
                connection.release();
                callback(err, postId);
              });
            });
          } else {
            connection.release();
            callback(err, false);
          }
        }
      });
    });
  },
  getNews: function (userId, topId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL get_news (?, ?)'
        , params = [userId, topId];
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = utils.getAvatarUrl(rows[i].pictureId);
            }
          }
          callback(err, rows);
        }
      });
    });
  },
  // deletes/mutes News post, this action is individual
  deleteNewsPost: function (userId, postId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL delete_news_post (?,?)'
        , params = [userId, postId];
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err || !result) { callback(err, false); }
        else { callback(err, true); }
      });
    });
  },
  // deletes post from personal Wall, News and followers' News
  deleteWallPost: function (userId, postId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL delete_wall_post (?,?)'
        , params = [userId, postId];
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err || !result) { callback(err, false); }
        else { callback(err, true); }
      });
    });
  },
  checkNewsUpdates: function (userId, topId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL check_news_updates (?,?)'
        , params = [userId, topId];
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
  getNewsUpdates: function (userId, topId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL get_news_updates (?,?)'
        , params = [userId, topId];
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = utils.getAvatarUrl(rows[i].pictureId);
            }
          }
          callback(err, rows);
        }
      });
    });
  },
  getPostsByHashTag: function (callerId, hashtag, topId, callback) {
    pool.getConnection(function (err, connection) {
      connection.query('CALL get_posts_by_tag (?,?)', [hashtag, topId], function (err, result) {
        connection.release();
        if (err) { callback (err, null); }
        else {
          var rows = result[0];
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = utils.getAvatarUrl(rows[i].pictureId);
            }
          }
          callback(err, rows);
        }
      });
    });
  },
  addComment: function (json, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL add_comment (?,?,?,?)'
        , params = [json.userId, json.postId, json.created, json.content];
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else { callback(err, { id: result[0][0].insertId }); }
      });
    });
  },
  // TODO: review
  getPostWithComments: function (postId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'CALL get_post_full(?)'
        , params = [postId];
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          if (!rows || rows.length === 0 || !rows[0] || rows[0].length === 0) {
            callback(err, null);
          } else {
            var post = rows[0];
            post.pictureUrl = utils.getAvatarUrl(post.pictureId);
            if (result[1] && result[1].length > 0) {
              post.commentsCount = result[1].length;
              post.comments = result[1];
              for (var i = 0; i < post.comments.length; i++) {
                post.comments[i].pictureUrl = utils.getAvatarUrl(post.comments[i].pictureId);
              }
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
  // TODO: review
  getComments: function (postId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'SELECT c.*, u.account, u.name, u.emailHash as pictureId ' +
        'FROM comments AS c ' +
        'LEFT JOIN users AS u ON u.id = c.userId ' +
        'WHERE c.postId = ? ORDER BY created ASC';
      connection.query(command, [postId], function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          // init picture urls
          if (result.length > 0) {
            for (var i = 0; i < result.length; i++) {
              result[i].pictureUrl = utils.getAvatarUrl(result[i].pictureId);
            }
          }
          callback(err, result);
        }
      });
    });
  },
  // TODO: review
  getPostAuthor: function (postId, callback) {
    pool.getConnection(function (err, connection) {
      var command = 'SELECT u.id, u.account, u.name, u.email, u.emailHash AS pictureId ' +
        'FROM posts AS p ' +
        'LEFT JOIN users AS u ON u.id = p.userId ' +
        'WHERE p.id = ? LIMIT 1';
      connection.query(command, [postId], function (err, result) {
        connection.release();
        if (err) {
          callback(err, null);
          return;
        }

        if (!result || result.length === 0) {
          callback(err, null);
          return;
        }

        callback(err, result[0]);
      });
    });
  }
};

module.exports = Provider;