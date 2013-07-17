'use strict';

var config = require('../../config')
	, sql = require('msnodesql')
  , passwordHash = require('password-hash')
  , crypto = require('crypto');

function Provider() {
  // create connection based on either full connection string or it's blocks
	this.connection = config.data.connectionString ||
		'Driver={SQL Server Native Client 11.0};Server=' + config.data.host + 
		';Database=' + config.data.database + 
		';Uid=' + config.data.user + 
		';Pwd=' + config.data.password +
		';';
}

Provider.prototype = {
  getAccountById: function (id, callback) {
    var command = 'exec get_account_by_id ?'
      , params = [id];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) { return callback(err, null); }
      if (result.length > 0) { return callback(err, result[0]); }
      else { return callback(err, null); }
    });
  },
  getAccount: function (account, callback) {
    var command = 'exec get_account ?'
      , params = [account];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) { return callback(err, null); }
      if (result.length > 0) { return callback(err, result[0]); }
      else { return callback(err, null); }
    });
  },
  createAccount: function (json, callback) {
    var emailHash = crypto.createHash('md5').update(json.email.trim().toLowerCase()).digest('hex')
      , command = 'exec create_account ?,?,?,?,?'
      , params = [json.account, json.name, json.password, json.email, emailHash];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        var errorMessage = 'Error creating account.';
        if (err.code === 2601) {
          errorMessage = 'User with such account already exists.';
        }
        callback(errorMessage);
      } else {
        callback(null, { id: result[0].insertId });
      }
    });
  },
  updateAccount: function (id, json, callback) {
    var command = 'UPDATE users SET '
      , params = [];
    // update 'user.name'
    if (json.name && json.name.length > 0) {
      command = command + 'name = ?';
      params.push(json.name);
    }
    // update or reset user.location
    if (json.location && json.location.length > 0) {
      if (params.length > 0) { command = command + ', '; }
      command = command + 'location = ?';
      params.push(json.location);
    } else {
      if (params.length > 0) { command = command + ', '; }
      command = command + 'location = null';
    }
    // update or reset user.website
    if (json.website && json.website.length > 0) {
      if (params.length > 0) { command = command + ', '; }
      command = command + 'website = ?';
      params.push(json.website);
    } else {
      if (params.length > 0) { command = command + ', '; }
      command = command + 'website = null';
    }
    // update or reset user.bio
    if (json.bio && json.bio.length > 0) {
      if (params.length > 0) { command = command + ', '; }
      command = command + 'bio = ?';
      params.push(json.bio);
    } else {
      if (params.length > 0) { command = command + ', '; }
      command = command + 'bio = null';
    }

    if (params.length === 0) {
      callback(null, null);
    } else {
      command = command + ' WHERE id = ?';
      params.push(id);

      sql.query(this.connection, command, params, function (err, result) {
        callback(err, result);
      });
    }
  },
//  validateAccountPassword: function (account, password, callback) {
//    if (!account || account.length == 0)
//      return callback('Account is not defined', false);
//    if (!password || password.length == 0)
//      return callback('Password is not defined', false);
//    this.getAccount(account, function (err, user) {
//      if (err) return callback('Account not found', false);
//      if (passwordHash.verify(password, user.password))
//        return callback(null, true);
//      else
//        return callback('Invalid password.', false);
//    });
//  },
  setAccountPassword: function (userId, password, callback) {
    var self = this;
    if (!userId || !password || password.length === 0) {
      callback('Error setting account password.', null);
    } else {
      self.getAccountById(userId, function (err, result) {
        if (err) {
          console.log(err);
          callback(err, result);
        } else {
          var hashedPassword = passwordHash.generate(password)
            , command = 'UPDATE users SET password = ? WHERE id = ?'
            , params = [hashedPassword, userId];
          sql.query(self.connection, command, params, function (err, result) {
            if (err) {
              console.log(err);
              callback(err, result);
            } else {
              callback(null, hashedPassword);
            }
          });
        }
      });
    }
  },
  getPublicProfile: function (callerAccount, targetAccount, callback) {
    var command = 'exec get_public_profile ?,?'
      , params = [callerAccount, targetAccount];
    sql.query(this.connection, command, params, function (err, result) {
      if (err || result.length === 0) {
        console.log(err);
        callback(err, null);
      } else {
        callback(err, result[0]);
      }
    });
  },
  followAccount: function (callerId, targetAccount, callback) {
    var command = 'exec follow_account ?,?'
      , params = [callerId, targetAccount];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) { console.log(err); }
      callback(err, result);
    });
  },
  unfollowAccount: function (callerId, targetAccount, callback) {
    var command = 'exec unfollow_account ?,?'
      , params = [callerId, targetAccount];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) { console.log(err); }
      callback(err, result);
    });
  },
  getMentions: function (callerId, account, topId, callback) {
    var command = 'exec get_mentions ?,?,?'
      , params = [callerId, account, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else { callback(err, result); }
    });
  },
  getPeople: function (callerId, topId, callback) {
    var command = 'exec get_people ?,?'
      , params = [callerId, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else { callback(err, result); }
    });
  },
  getFollowers: function (callerId, targetAccount, topId, callback) {
    var command = 'exec get_followers ?,?,?'
      , params = [callerId, targetAccount, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else { callback(err, result); }
    });
  },
  getFollowing: function (callerId, targetAccount, topId, callback) {
    var command = 'exec get_following ?,?,?'
      , params = [callerId, targetAccount, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else { callback(err, result); }
    });
  },
  getTimeline: function (callerId, targetAccount, topId, callback) {
    var command = 'exec get_timeline ?,?,?'
      , params = [callerId, targetAccount, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else { callback(err, result); }
    });
  },
  addPost: function (json, callback) {
    var command = 'exec add_post ?,?,?'
      , params = [json.userId, json.content, json.created];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(err, { id: result[0].insertId });
      }
    });
  },
  getMainTimeline: function (userId, topId, callback) {
    var command = 'exec get_main_timeline ?,?'
      , params = [userId, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(err, result);
      }
    });
  },
  deletePost: function (postId, userId, callback) {
    var command = 'exec delete_post ?,?'
      , params = [userId, postId];
    sql.query(this.connection, command, params, function (err) {
      if (err) {
        console.log(err);
        callback(err, false);
      } else { callback(err, true); }
    });
  },
  getTimelineUpdatesCount: function (userId, topId, callback) {
    var command = 'exec get_timeline_updates_count ?,?'
      , params = [userId, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        // returns a json object like { posts: 0 }
        callback(err, result[0]);
      }
    });
  },
  getTimelineUpdates: function (userId, topId, callback) {
    var command = 'exec get_timeline_updates ?,?'
      , params = [userId, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else { callback(err, result); }
    });
  },
  getPostsByHashTag: function (callerId, hashtag, topId, callback) {
    var tag = hashtag;
    if (tag.indexOf('#') !== 0) {
      tag = '#' + tag;
    }
    var command = 'exec get_posts_by_hashtag ?,?,?'
      , params = [callerId, tag, topId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else { callback(err, result); }
    });
  },
  addComment: function (json, callback) {
    var command = 'exec add_comment ?,?,?,?'
      , params = [json.userId, json.postId, json.created, json.content];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(err, { id: result[0].insertId });
      }
    });
  },
  getPostWithComments: function (postId, callback) {
    var self = this
      , command_post = 'exec get_post ?'
      , command_comments = 'exec get_comments ?'
      , params = [postId];
    sql.query(self.connection, command_post, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        if (result.length === 0) {
          callback(err, null);
        } else {
          var post = result[0];
          sql.query(self.connection, command_comments, params, function (err, result) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else {
              if (result.length > 0) {
                post.commentsCount = result.length;
                post.comments = result;
              } else {
                post.commentsCount = 0;
                post.comments = [];
              }
              callback(err, post);
            }
          });
        }
      }
    });
  },
  getComments: function (postId, callback) {
    var command = 'exec get_comments ?'
      , params = [postId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(err, result);
      }
    });
  },
  getPostAuthor: function (postId, callback) {
    var command = 'exec get_post_author ?'
      , params = [postId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        if (result.length === 0) {
          console.log(postId);
          return callback(err, null);
        }
        console.log(result);
        return callback(err, result[0]);
      }
    });
  },
  getSavedSearches: function (userId, callback) {
    var command = 'exec get_search_lists ?'
      , params = [userId];
    sql.query(this.connection, command, params, function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(false, result[0]);
      }
    });
  },
  addSavedSearch: function (json, callback) {
    var command = 'exec add_search_list ?,?,?,?'
      , params = [json.name, json.userId, json.q, json.src];
    sql.query(this.connection, command, params, function (err) {
      if (err) {
        console.log(err);
        callback(err);
      } else {
        callback(false);
      }
    });
  },
  deleteSavedSearch: function (userId, name, callback) {
    var command = 'exec delete_search_list ?,?'
      , params = [userId, name];
    sql.query(this.connection, command, params, function (err) {
      if (err) {
        console.log(err);
        callback(err);
      } else {
        callback(false);
      }
    });
  }
};

module.exports = Provider;