'use strict';

var mysql = require('mysql')
  , config = require('../../config');

/**
 * Return the 'MySqlSessionStore' extending `connect`'s session Store.
 *
 * @param {Object} connect
 * @returns {Function}
 */
module.exports = function (connect) {

  /**
   * Connect's Store.
   */
  var Store = connect.session.Store;

  /**
   * Initialize MySqlSessionStore with the given 'options'.
   *
   * @param {Object} options
   * @constructor
   */
  function MySqlSessionStore(options) {
    var self = this;
    options = options || {
      prefix: 'sess'
    };
    Store.call(this, options);
    this.prefix = null === options.prefix ? 'sess:' : options.prefix;

    // create database connection based on configuration settings
    this.connection = mysql.createConnection(config.data.connectionString || {
      host: config.data.host,
      database: config.data.database,
      user: config.data.user,
      password: config.data.password
    });

    // create table if not exists
    var command = 'CREATE  TABLE IF NOT EXISTS `_mysql_session_store` (`id` VARCHAR(255) NOT NULL, `expires` BIGINT NULL, `data` TEXT NULL, PRIMARY KEY (`id`));';
    this.connection.query(command, function (err) {
      if (err) { throw err; }
    });

    // every minute go and burn the old sessions
    var checkUpInterval = typeof(config.server.sessionCleanupTime) === "undefined" ? 60000 : config.server.sessionCleanupTime;
    if(checkUpInterval > 0) {
      setInterval(function(){
        //console.log('[info]: cleaning old sessions...');
        var now = new Date().valueOf();
        self.connection.query('DELETE FROM _mysql_session_store WHERE expires < ?', [now], function (err) {
          if (err) { console.log(err); }
        });
      }, checkUpInterval);
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
    //console.log('GET "%s"', sid);

    this.connection.query('SELECT * FROM _mysql_session_store WHERE id = ? LIMIT 1', [sid], function (err, result) {
      if (err) { return callback(err); }
      if (!result || result.length === 0) { return callback(); }
      var session = JSON.parse(result[0].data);
      //console.log('GOT %s', JSON.stringify(session, null, 2));
      return callback(null, session);
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

    //console.log('SET-SESSION "%s" expires:%s %s', sid, expires, data);

    var command = 'INSERT INTO _mysql_session_store (id, expires, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expires=?, data=?;';
    var params = [sid, expires, data, expires, data];
    this.connection.query(command, params, function (err) {
      if (err) { console.log(err); }
      callback(err);
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
    this.connection.query('DELETE FROM _mysql_session_store WHERE id = ?', [sid], function (err) {
      callback(err ? err : null);
    });
  };

  return MySqlSessionStore;
};