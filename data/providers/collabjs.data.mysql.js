'use strict';

var config = require('../../config')
  , pool = require('./collabjs.pool.mysql').pool
  , passwordHash = require('password-hash')
  , crypto = require('crypto');

function Provider() {}

Provider.prototype = {
  getAccountById: function (id, callback) {
    var command = "SELECT u.*, emailHash as pictureId, GROUP_CONCAT(r.loweredName separator ',') AS roles " +
      "FROM users AS u " +
      "LEFT JOIN user_roles AS ur on ur.userId = u.id " +
      "LEFT JOIN roles AS r ON r.id = ur.roleId " +
      "WHERE u.id = ? GROUP BY u.id LIMIT 1";
    pool.getConnection(function (err, connection) {
      connection.query(command, [id], function (err, result) {
        connection.release();
        if (err) { return callback(err, null); }
        if (result.length > 0) {
          result[0].pictureUrl = config.env.avatarServer + '/avatar/' + result[0].pictureId;
          return callback(err, result[0]);
        }
        else { return callback(err, null); }
      });
    });
  },
  getAccount: function (account, callback) {
    var command = "SELECT u.*, emailHash as pictureId, GROUP_CONCAT(r.loweredName separator ',') AS roles " +
      "FROM users AS u " +
      "LEFT JOIN user_roles AS ur on ur.userId = u.id " +
      "LEFT JOIN roles AS r ON r.id = ur.roleId " +
      "WHERE u.account = ? GROUP BY u.id LIMIT 1";
    pool.getConnection(function (err, connection) {
      connection.query(command, [account], function (err, result) {
        connection.release();
        if (err) { return callback(err, null); }
        if (result.length > 0) {
          result[0].pictureUrl = config.env.avatarServer + '/avatar/' + result[0].pictureId;
          return callback(err, result[0]);
        }
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
    var fields = {
      location: json.location || '',  // update or reset user.location
      website: json.website || '',    // update or reset user.website
      bio: json.bio || ''             // update or reset user.bio
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
  getPublicProfile: function (callerId, targetAccount, callback) {
    var command = 'SELECT u.id, u.account, u.name, u.website, u.bio, u.emailHash AS pictureId, u.location, u.posts, u.following, u.followers, ' +
      '(SELECT IF(u.id = ?, TRUE, FALSE)) AS isOwnProfile, ' +
      '(SELECT IF ((SELECT COUNT(userId) FROM `following` AS f WHERE f.userId = ? AND f.targetId = u.id LIMIT 1) > 0, TRUE, FALSE)) AS isFollowed ' +
      'FROM users AS u ' +
      'WHERE u.account = ? LIMIT 1';
    pool.getConnection(function (err, connection) {
      connection.query(command, [callerId, callerId, targetAccount], function (err, result) {
        connection.release();
        if (err || result.length === 0) { callback(err, null); }
        else {
          var profile = result[0];
          profile.pictureUrl = config.env.avatarServer + '/avatar/' + profile.pictureId;
          callback(err, profile);
        }
      });
    });
  },
  followAccount: function (callerId, targetAccount, callback) {
    var command = 'CALL subscribe_account(?,?)';
    pool.getConnection(function (err, connection) {
      connection.query(command, [callerId, targetAccount], function (err, result) {
        connection.release();
        callback(err, result);
      });
    });
  },
  unfollowAccount: function (callerId, targetAccount, callback) {
    var command = 'CALL unsubscribe_account(?,?)';
    pool.getConnection(function (err, connection) {
      connection.query(command, [callerId, targetAccount], function (err, result) {
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
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = config.env.avatarServer + '/avatar/' + rows[i].pictureId;
            }
          }
          callback(err, rows);
        }
      });
    });
  },
  getPeople: function (callerId, topId, callback) {
    var command = 'CALL get_people(?,?)';
    pool.getConnection(function (err, connection) {
      connection.query(command, [callerId, topId], function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = config.env.avatarServer + '/avatar/' + rows[i].pictureId;
            }
          }
          callback(err, rows);
        }
      });
    });
  },
  getFollowers: function (callerId, targetId, callback) {
    var command = 'SELECT u.id, u.account, u.name, u.website, u.location, u.bio, u.emailHash as pictureId, u.posts, u.following, u.followers' +
      ', (SELECT IF(u.id = ?, TRUE, FALSE)) AS isOwnProfile ' +
      ', (SELECT IF ((SELECT COUNT(sub.userId) FROM following AS sub WHERE sub.userId = ? AND sub.targetId = u.id) > 0, TRUE, FALSE )) AS isFollowed ' +
      'FROM following AS f ' +
      'LEFT JOIN users AS u ON u.id = f.userId ' +
      'WHERE f.targetId = ?';
    pool.getConnection(function (err, connection) {
      connection.query(command, [callerId, callerId, targetId], function (err, result) {
        connection.release();
        // init picture urls
        if (result.length > 0) {
          for (var i = 0; i < result.length; i++) {
            result[i].pictureUrl = config.env.avatarServer + '/avatar/' + result[i].pictureId;
          }
        }
        callback(err, result);
      });
    });
  },
  getFollowing: function (callerId, targetId, callback) {
    var command = 'SELECT u.id, u.account, u.name, u.website, u.location, u.bio, u.emailHash as pictureId, u.posts, u.following, u.followers' +
      ', (SELECT IF(u.id = ?, TRUE, FALSE)) AS isOwnProfile' +
      ', (SELECT IF ((SELECT COUNT(sub.userId) FROM following AS sub WHERE sub.userId = ? AND sub.targetId = u.id) > 0, TRUE, FALSE)) AS isFollowed ' +
      'FROM following AS f ' +
      'LEFT JOIN users AS u ON u.id = f.targetId ' +
      'WHERE f.userId = ?';

    pool.getConnection(function (err, connection) {
      connection.query(command, [callerId, callerId, targetId], function (err, result) {
        connection.release();
        // init picture urls
        if (result.length > 0) {
          for (var i = 0; i < result.length; i++) {
            result[i].pictureUrl = config.env.avatarServer + '/avatar/' + result[i].pictureId;
          }
        }
        callback(err, result);
      });
    });
  },
  // TODO: rename to 'getWall'
  getTimeline: function (callerId, targetAccount, topId, callback) {
    var command = 'CALL get_timeline(?,?,?)'
      , params = [callerId, targetAccount, topId];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          var rows = result[0];
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = config.env.avatarServer + '/avatar/' + rows[i].pictureId;
            }
          }
          callback(err, rows);
        }
      });
    });
  },
  addPost: function (json, callback) {
    var command = 'INSERT INTO posts (userId, content, created)  VALUES (?, ?, ?)'
      , params = [json.userId, json.content, json.created];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else { callback(err, result.insertId); }
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
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = config.env.avatarServer + '/avatar/' + rows[i].pictureId;
            }
          }
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
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = config.env.avatarServer + '/avatar/' + rows[i].pictureId;
            }
          }
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
          // init picture urls
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              rows[i].pictureUrl = config.env.avatarServer + '/avatar/' + rows[i].pictureId;
            }
          }
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
        else { callback(err, { id: result[0][0].insertId }); }
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
            post.pictureUrl = config.env.avatarServer + '/avatar/' + post.pictureId;
            if (result[1] && result[1].length > 0) {
              post.commentsCount = result[1].length;
              post.comments = result[1];
              for (var i = 0; i < post.comments.length; i++) {
                post.comments[i].pictureUrl = config.env.avatarServer + '/avatar/' + post.comments[i].pictureId;
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
  getComments: function (postId, callback) {
    var command = 'SELECT c.*, u.account, u.name, u.emailHash as pictureId ' +
      'FROM comments AS c ' +
      'LEFT JOIN users AS u ON u.id = c.userId ' +
      'WHERE c.postId = ? ORDER BY created ASC';
    pool.getConnection(function (err, connection) {
      connection.query(command, [postId], function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else {
          // init picture urls
          if (result.length > 0) {
            for (var i = 0; i < result.length; i++) {
              result[i].pictureUrl = config.env.avatarServer + '/avatar/' + result[i].pictureId;
            }
          }
          callback(err, result);
        }
      });
    });
  },
  getPostAuthor: function (postId, callback) {
    var command = 'SELECT u.id, u.account, u.name, u.email, u.emailHash AS pictureId ' +
      'FROM posts AS p ' +
      'LEFT JOIN users AS u ON u.id = p.userId ' +
      'WHERE p.id = ? LIMIT 1';
    pool.getConnection(function (err, connection) {
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
  },
  getSavedSearches: function (userId, callback) {
    var command = 'SELECT s.name, s.query, s.source FROM search_lists AS s WHERE s.userId = ?';
    pool.getConnection(function (err, connection) {
      connection.query(command, [userId], function (err, result) {
        connection.release();
        if (err) { callback(err, null); }
        else { callback(null, result); }
      });
    });
  },
  addSavedSearch: function (json, callback) {
    var command = 'INSERT IGNORE INTO `search_lists` (name, userId, query, source) VALUES (?,?,?,?)'
      , params = [json.name, json.userId, json.q, json.src];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err) {
        connection.release();
        callback(err);
      });
    });
  },
  deleteSavedSearch: function (userId, name, callback) {
    var command = 'DELETE FROM search_lists WHERE userId = ? AND name = ?';
    pool.getConnection(function (err, connection) {
      connection.query(command, [userId, name], function (err) {
        connection.release();
        callback(err);
      });
    });
  }
};

module.exports = Provider;