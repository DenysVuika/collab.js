var config = require('../../config')
	, mysql = require('mysql')
  , passwordHash = require('password-hash');

function Provider() {
	this.connection = mysql.createConnection({
		host: config.data.host,
		database: config.data.database,
		user: config.data.user,
		password: config.data.password
	});
}

Provider.prototype = {
  getAccountById: function (id, callback) {
    this.connection.query('CALL get_account_by_id(?)', [id], function (err, result) {
      if (err) return callback(err, null);
      var rows = result[0];
      if (rows.length > 0) callback(err, rows[0]);
      else callback(err, null);
    });
  },
  getAccount: function (account, callback) {
    this.connection.query('CALL get_account(?)', [account], function (err, result) {
      if (err) return callback(err, null);
      var rows = result[0];
      if (rows.length > 0) callback(err, rows[0]);
      else callback(err, null);
    });
  },
  createAccount: function (json, callback) {
    this.connection.query('INSERT INTO users SET ?', json, function (err, result) {
      if (err) {
        console.log(err);
        var errorMessage = 'Error creating account.';
        if (err.code === 'ER_DUP_ENTRY')
          errorMessage = 'User with such account already exists.';
        return callback(errorMessage);
      } else {
        callback(null, { id: result.insertId });
      }
    });
  },
  updateAccount: function (id, json, callback) {
    var fields = {};
    if (json.name && json.name.length > 0)
      fields.name = json.name;
    if (json.location)
      fields.location = json.location;
    else
      fields.location = '';
    if (json.website && json.website.length > 0)
      fields.website = json.website;
    if (json.bio && json.bio.length > 0)
      fields.bio = json.bio;

    this.connection.query('UPDATE users SET ? WHERE id = ' + this.connection.escape(id), fields, function (err, result) {
      if (err) console.log('Error updating account settings. ' + err);
      callback(err, result);
    });
  },
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
      self.connection.query(command, [hashedPassword, userId], function (err, result) {
        if (err) {
          console.log(err);
          return callback(err, result);
        }
        return callback(null, hashedPassword);
      });
    });
  },
  getProfilePictureId: function (userId, callback) {
    this.connection.query('SELECT id FROM pictures WHERE userId = ?', [userId], function (err, result) {
      if (err) {
        console.log('Error reading pictures. ' + err);
        callback(err, null);
      }
      else if (result.length > 0) callback(null, { id: result[0].id });
      else callback(null, null);
    });
  },
  updateProfilePicture: function (id, json, callback) {
    this.connection.query('UPDATE pictures SET ? WHERE id = ' + this.connection.escape(id), json, function (err, result) {
      if (err) console.log('Error updating picture. ' + err);
      callback(err, result);
    });
  },
  addProfilePicture: function (json, callback) {
    this.connection.query('INSERT INTO pictures SET ?', json, function (err, result) {
      if (err) console.log('Error inserting picture. ' + err);
      callback(err, result);
    });
  },
  getProfilePicture: function (account, callback) {
    var query = 'SELECT p.* FROM pictures as p LEFT JOIN users as u ON u.id = p.userId WHERE u.account = ? LIMIT 1';
    this.connection.query(query, [account], function (err, result) {
      if (err || !result || result.length == 0) {
        callback(err, null);
      } else {
        callback(err, result[0]);
      }
    });
  },
  getPublicProfile: function (callerAccount, targetAccount, callback) {
    this.connection.query('CALL get_public_profile(?,?)', [callerAccount, targetAccount], function (err, result) {
      if (err || !result || result.length != 2 || result[0].length == 0) {
        console.log('Error getting public profile.' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows[0]);
      }
    });
  },
  followAccount: function (callerId, targetAccount, callback) {
    this.connection.query('CALL subscribe_account(?,?)', [callerId, targetAccount], function (err, result) {
      if (err) console.log('Error subscribing account.' + err);
      callback(err, result);
    });
  },
  unfollowAccount: function (callerId, targetAccount, callback) {
    this.connection.query('CALL unsubscribe_account(?,?)', [callerId, targetAccount], function (err, result) {
      if (err) console.log('Error unsubscribing account. ' + err);
      callback(err, result);
    });
  },
  getMentions: function (account, topId, callback) {
    this.connection.query('CALL get_mentions(?,?)', [account, topId], function (err, result) {
      if (err) {
        console.log('Error getting mentions. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows);
      }
    });
  },
  getPeople: function (callerId, topId, callback) {
    this.connection.query('CALL get_people(?,?)', [callerId, topId], function (err, result) {
      if (err) {
        console.log('Error getting people. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows);
      }
    });
  },
  getFollowers: function (callerId, targetAccount, topId, callback) {
    this.connection.query('CALL get_followers(?,?,?)', [callerId, targetAccount, topId], function (err, result) {
      if (err) {
        console.log('Error getting followers. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows);
      }
    });
  },
  getFollowing: function (callerId, targetAccount, topId, callback) {
    this.connection.query('CALL get_following(?,?,?)', [callerId, targetAccount, topId], function (err, result) {
      if (err) {
        console.log('Error getting following. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows);
      }
    });
  },
  getTimeline: function (targetAccount, topId, callback) {
    this.connection.query('CALL get_timeline(?,?)', [targetAccount, topId], function (err, result) {
      if (err) {
        console.log('Error getting timeline. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows);
      }
    });
  },
  addPost: function (json, callback) {
    this.connection.query('INSERT INTO posts SET ?', json, function (err, result) {
      if (err) {
        console.log('Erro creating post. ' + err);
        callback(err, null);
      } else {
        callback(err, { id: result.insertId });
      }
    });
  },
  getMainTimeline: function (userId, topId, callback) {
    this.connection.query('CALL get_main_timeline(?, ?)', [userId, topId], function (err, result) {
      if (err) {
        console.log('Error getting posts. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows);
      }
    });
  },
  deletePost: function (postId, userId, callback) {
    var query = 'DELETE FROM posts WHERE id = ? AND userId = ?';
    this.connection.query(query, [postId, userId], function (err, result) {
      if (err || !result || result.affectedRows == 0) {
        console.log('Error removing post. ' + err);
        callback(err, false);
      } else callback(err, true);
    });
  },
  getTimelineUpdatesCount: function (userId, topId, callback) {
    this.connection.query('CALL get_timeline_updates_count(?,?)', [userId, topId], function (err, result) {
      if (err) {
        console.log('Error getting timeline updates count. ' + err);
        callback(err, null);
      } else {
        var row = result[0];
        callback(err, row[0])
      }
    });
  },
  getTimelineUpdates: function (userId, topId, callback) {
    this.connection.query('CALL get_timeline_updates(?,?)', [userId, topId], function (err, result) {
      if (err) {
        console.log('Error getting timeline updates. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows);
      }
    });
  },
  addComment: function (json, callback) {
    this.connection.query('INSERT INTO comments SET ?', json, function (err, result) {
      if (err) {
        console.log('Error inserting comment. ' + err);
        callback(err, null);
      } else {
        callback(err, { id: result.insertId });
      }
    });
  },
  getPostWithComments: function (postId, callback) {
    this.connection.query('CALL get_post_full(?)', postId, function (err, result) {
      if (err) {
        console.log('Error getting full post. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        if (!rows || rows.length == 0 || !rows[0] || rows[0].length == 0) {
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
  },
  getComments: function (postId, callback) {
    this.connection.query('CALL get_comments(?)', postId, function (err, result) {
      if (err) {
        console.log('Error getting comments.' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        callback(err, rows);
      }
    });
  },
  getPostAuthor: function (postId, callback) {
    this.connection.query('CALL get_post_author(?)', postId, function (err, result) {
      if (err) {
        console.log('Error getting post author. ' + err);
        callback(err, null);
      } else {
        var rows = result[0];
        if (!rows || rows.length == 0) {
          console.log('Post author not found. PostId: ' + postId);
          return callback(err, null);
        }
        callback(err, rows[0]);
      }
    });
  }
};

module.exports = Provider;
//exports = module.exports = new Provider();