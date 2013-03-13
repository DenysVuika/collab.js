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
    sql.query(this.connection, 'exec get_account_by_id ?', [id], function (err, result) {
      if (err) return callback(err, null);
      if (result.length > 0) callback(err, result[0]);
      else callback(err, null);
    });
  },
  getAccount: function (account, callback) {
    sql.query(this.connection, 'exec get_account ?', [account], function (err, result) {
      if (err) return callback(err, null);
      if (result.length > 0) callback(err, result[0]);
      else callback(err, null);
    });
  },
  createAccount: function (json, callback) {
    // var user = {
    //      account: body.account,
    //      name: body.name,
    //      password: hashedPassword,
    //      email: body.email
    //    };
    var emailHash = crypto.createHash('md5').update(json.email.trim().toLowerCase()).digest('hex');
    var command = 'exec create_account ?,?,?,?,?';
    sql.query(this.connection, command, [json.account, json.name, json.password, json.email, emailHash], function (err, result) {
      if (err) {
        console.log(err);
        var errorMessage = 'Error creating account.';
        if (err.code === 2601)
          errorMessage = 'User with such account already exists.';
        return callback(errorMessage);
      }
      callback(null, { id: result[0].insertId });
    });
  },
  updateAccount: function (id, json, callback) {
    var command = 'UPDATE users SET ';
    var params = [];
    // update 'user.name'
    if (json.name && json.name.length > 0) {
      command = command + 'name = ?';
      params.push(json.name);
    }
    // update or reset user.location
    if (json.location && json.location.length > 0) {
      if (params.length > 0) command = command + ', ';
      command = command + 'location = ?';
      params.push(json.location);
    } else {
      if (params.length > 0) command = command + ', ';
      command = command + 'location = null';
    }
    // update or reset user.website
    if (json.website && json.website.length > 0) {
      if (params.length > 0) command = command + ', ';
      command = command + 'website = ?';
      params.push(json.website);
    } else {
      if (params.length > 0) command = command + ', ';
      command = command + 'website = null';
    }
    // update or reset user.bio
    if (json.bio && json.bio.length > 0) {
      if (params.length > 0) command = command + ', ';
      command = command + 'bio = ?';
      params.push(json.bio);
    } else {
      if (params.length > 0) command = command + ', ';
      command = command + 'bio = null';
    }

    if (params.length == 0) return callback(null, null);
    command = command + ' WHERE id = ?';
    params.push(id);

    sql.query(this.connection, command, params, function (err, result) {
      callback(err, result);
    });
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
    if (!userId || !password || password.length == 0) {
      return callback('Error setting account password.', null);
    }
    self.getAccountById(userId, function (err, result) {
      if (err) {
        console.log(err);
        return callback(err, result);
      }
      var hashedPassword = passwordHash.generate(password);
      var command = 'UPDATE users SET password = ? WHERE id = ?';
      sql.query(self.connection, command, [hashedPassword, userId], function (err, result) {
        if (err) {
          console.log(err);
          return callback(err, result);
        }
        return callback(null, hashedPassword);
      });
    });
  },
  getPublicProfile: function (callerAccount, targetAccount, callback) {
    sql.query(this.connection, 'exec get_public_profile ?, ?', [callerAccount, targetAccount], function (err, result) {
      if (err || result.length == 0) {
        console.log('Error getting public profile. ' + err);
        callback(err, null);
      } else callback(err, result[0]);
    });
  },
  followAccount: function (callerId, targetAccount, callback) {
    sql.query(this.connection, 'exec follow_account ?,?', [callerId, targetAccount], function (err, result) {
      console.log('callerId: ' + callerId + ', targetAccount: ' + targetAccount);
      if (err) console.log('Error following account. ' + err);
      callback(err, result);
    });
  },
  unfollowAccount: function (callerId, targetAccount, callback) {
    sql.query(this.connection, 'exec unfollow_account ?,?', [callerId, targetAccount], function (err, result) {
      if (err) console.log('Error unfollowing account.' + err);
      callback(err, result);
    });
  },
  getMentions: function (account, topId, callback) {
    sql.query(this.connection, 'exec get_mentions ?,?', [account, topId], function (err, result) {
      if (err) {
        console.log('Error getting mentions. ' + err);
        callback(err, null);
      } else callback(err, result);
    });
  },
  getPeople: function (callerId, topId, callback) {
    sql.query(this.connection, 'exec get_people ?,?', [callerId, topId], function (err, result) {
      if (err) {
        console.log('Error getting people. ' + err);
        callback(err, null);
      } else callback(err, result);
    });
  },
  getFollowers: function (callerId, targetAccount, topId, callback) {
    sql.query(this.connection, 'exec get_followers ?,?,?', [callerId, targetAccount, topId], function (err, result) {
      if (err) {
        console.log('Error getting followers. ' + err);
        callback(err, null);
      } else callback(err, result);
    });
  },
  getFollowing: function (callerId, targetAccount, topId, callback) {
    sql.query(this.connection, 'exec get_following ?,?,?', [callerId, targetAccount, topId], function (err, result) {
      if (err) {
        console.log('Error getting following. ' + err);
        callback(err, null);
      } else callback(err, result);
    });
  },
  getTimeline: function (targetAccount, topId, callback) {
    sql.query(this.connection, 'exec get_timeline ?,?', [targetAccount, topId], function (err, result) {
      if (err) {
        console.log('Error getting timeline. ' + err);
        callback(err, null);
      } else callback(err, result);
    });
  },
  addPost: function (json, callback) {
    /*var post = {
     userId: req.user.id,
     content: req.body.content,
     created: date
     };*/
    var command = 'exec add_post ?,?,?';
    sql.query(this.connection, command, [json.userId, json.content, json.created], function (err, result) {
      if (err) {
        console.log('Error creating post. ' + err);
        callback(err, null);
      } else {
        callback(err, { id: result[0].insertId });
      }
    });
  },
  getMainTimeline: function (userId, topId, callback) {
    sql.query(this.connection, 'exec get_main_timeline ?, ?', [userId, topId], function (err, result) {
      if (err) {
        console.log('Error getting posts. ' + err);
        callback(err, null);
      } else {
        callback(err, result);
      }
    });
  },
  deletePost: function (postId, userId, callback) {
    var command = 'DELETE FROM posts WHERE id = ? AND userId = ?';
    sql.query(this.connection, command, [postId, userId], function (err, result) {
      if (err) {
        console.log('Error removing post. ' + err);
        callback(err, false);
      } else callback(err, true);
    });
  },
  getTimelineUpdatesCount: function (userId, topId, callback) {
    sql.query(this.connection, 'exec get_timeline_updates_count ?,?', [userId, topId], function (err, result) {
      if (err) {
        console.log('Error getting timeline updates count. ' + err);
        callback(err, null);
      } else {
        // returns a json object like { posts: 0 }
        callback(err, result[0]);
      }
    });
  },
  getTimelineUpdates: function (userId, topId, callback) {
    sql.query(this.connection, 'exec get_timeline_updates ?,?', [userId, topId], function (err, result) {
      if (err) {
        console.log('Error getting timeline updates. ' + err);
        callback(err, null);
      } else callback(err, result);
    });
  },
  getPostsByHashTag: function (hashtag, topId, callback) {
    var tag = hashtag;
    if (tag.indexOf('#') != 0)
      tag = '#' + tag;
    sql.query(this.connection, 'exec get_posts_by_hashtag ?,?', [tag, topId], function (err, result) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else callback(err, result);
    });
  },
  addComment: function (json, callback) {
    /*var comment = {
     userId: req.user.id,
     postId: req.body.postId,
     created: created,
     content: req.body.content
     };*/
    var command = 'exec add_comment ?,?,?,?';
    sql.query(this.connection, command, [json.userId, json.postId, json.created, json.content], function (err, result) {
      if (err) {
        console.log('Error inserting comment. ' + err);
        callback(err, null);
      } else {
        callback(err, { id: result[0].insertId });
      }
    });
  },
  getPostWithComments: function (postId, callback) {
    var self = this;
    sql.query(self.connection, 'exec get_post ?', [postId], function (err, result) {
      if (err) {
        console.log('Error getting post. ' + err);
        callback(err, null);
      } else {
        if (result.length == 0) return callback(err, null);
        var post = result[0];
        sql.query(self.connection, 'exec get_comments ?', [postId], function (err, result) {
          if (err) {
            console.log('Error getting comments for post. ' + err);
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
    });
  },
  getComments: function (postId, callback) {
    sql.query(this.connection, 'exec get_comments ?', [postId], function (err, result) {
      if (err) {
        console.log('Error getting comments for post ' + postId + '. ' + err);
        callback(err, null);
      } else {
        callback(err, result);
      }
    });
  },
  getPostAuthor: function (postId, callback) {
    sql.query(this.connection, 'exec get_post_author ?', [postId], function (err, result) {
      if (err) {
        console.log('Error getting post author. ' + err);
        callback(err, null);
      } else {
        if (result.length == 0) {
          console.log('Post author not found. PostId: ' + postId);
          return callback(err, null);
        }
        console.log(result);
        callback(err, result[0]);
      }
    });
  }
};

module.exports = Provider;