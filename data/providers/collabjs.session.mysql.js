'use strict';

var session = require('express-session')
  , config = require('../../config')
  , pool = require('./collabjs.pool.mysql').pool;

/**
 * MySql-based Session Store implementation
 */
module.exports = (function () {

  var Store = session.Store;

  /**
   * Initialize MySqlSessionStore with the given 'options'.
   *
   * @param {Object} options
   * @constructor
   */
  function MySqlSessionStore(options) {
    var self = this;
    options = options || { prefix: 'sess' };
    Store.call(this, options);
    this.prefix = null === options.prefix ? 'sess:' : options.prefix;

    pool.getConnection(function (err, connection) {
      // create table if not exists
      var command = 'CREATE  TABLE IF NOT EXISTS `_mysql_session_store` (`id` VARCHAR(255) NOT NULL, `expires` BIGINT NULL, `data` TEXT NULL, PRIMARY KEY (`id`));';
      connection.query(command, function (err) {
        connection.release();
        if (err) { throw err; }
      });
    });

    // every minute go and burn the old sessions
    self.checkUpInterval = typeof(config.data.sessionCleanupTime) === "undefined" ? 60000 : config.data.sessionCleanupTime;
    if(self.checkUpInterval > 0) {
      setInterval(function(){
        //console.log('[info]: cleaning old sessions...');
        pool.getConnection(function (err, connection) {
          var now = new Date().valueOf();
          connection.query('DELETE FROM _mysql_session_store WHERE expires < ?', [now], function () {
            connection.release();
          });
        });
      }, self.checkUpInterval);
    }
  }

  /**
   * Inherit from `Store`.
   */
  MySqlSessionStore.prototype = Store.prototype;

  /**
   * Attempt to fetch session by the given 'sid'.
   * @param {String} sid
   * @param {Function} callback
   */
  MySqlSessionStore.prototype.get = function (sid, callback) {
    sid = this.prefix + sid;
    pool.getConnection(function (err, connection) {
      connection.query('SELECT * FROM _mysql_session_store WHERE id = ? LIMIT 1', [sid], function (err, result) {
        connection.release();
        if (err) { return callback(err); }
        if (!result || result.length === 0) { return callback(); }
        var session = JSON.parse(result[0].data);
        return callback(null, session);
      });
    });
  };

  /**
   * Commit the given 'session' object associated with the given 'sid'.
   *
   * @param {String} sid
   * @param {Session} session
   * @param {Function} callback
   */
  MySqlSessionStore.prototype.set = function (sid, session, callback) {
    sid = this.prefix + sid;
    var data = JSON.stringify(session);
    var expires = 'string' === typeof session.cookie.expires ? new Date(session.cookie.expires) : session.cookie.expires;
    expires = expires.valueOf();
    var command = 'INSERT INTO _mysql_session_store (id, expires, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expires=?, data=?;';
    var params = [sid, expires, data, expires, data];
    pool.getConnection(function (err, connection) {
      connection.query(command, params, function (err) {
        connection.release();
        callback(err);
      });
    });
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Function} callback
   */
  MySqlSessionStore.prototype.destroy = function (sid, callback) {
    sid = this.prefix + sid;
    pool.getConnection(function (err, connection) {
      connection.query('DELETE FROM _mysql_session_store WHERE id = ?', [sid], function (err) {
        connection.release();
        if (callback) {
          callback(err ? err : null);
        }
      });
    });
  };

  return MySqlSessionStore;
})();