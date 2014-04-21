'use strict';

// Runtime context implementation

var events = require('events')
  , config = require('./config')
  , auth = require('./collabjs.auth')
  , data = require('./data');

var runtimeEvents = {
  initStaticContent: 'app.init.static',
  initWebRoutes: 'app.init.routes',
  appStart: 'app.start',
  userRegistered: 'user_registered@collab.js'
};

var RuntimeContext = function() {

  // Call the super constructor
  events.EventEmitter.call(this);

  this.events = runtimeEvents;
  this.config = config;
  this.auth = auth;
  this.data = data;

  /**
   * Register JavaScript files for automatic loading at run time.
   * @param {string|string[]} paths Single or multiple JS paths.
   */
  this.js = function (paths) {
    if (!paths || !config.client || !config.client.js) {return;}
    var items = Array.isArray(paths) ? paths: [paths];
    var client = config.client;
    for (var i = 0; i < items.length; i++) {
      if (client.js.indexOf(paths[i]) < 0) {
        client.js.push(paths[i]);
        console.log('\t + ' + paths[i]);
      }
    }
  };

  /**
   * Register CSS files for automatic loading at run time.
   * @param {string|string[]} paths Single or multiple CSS paths.
   */
  this.css = function (paths) {
    if (!paths || !config.client || !config.client.css) {return;}
    var items = Array.isArray(paths) ? paths: [paths];
    var client = config.client;
    for (var i = 0; i < items.length; i++) {
      if (client.css.indexOf(paths[i]) < 0) {
        client.css.push(paths[i]);
        console.log('\t + ' + paths[i]);
      }
    }
  };

  // Return this object reference
  return (this);
};

// Extend runtime context class so that we can use on() and emit()
RuntimeContext.prototype = Object.create(events.EventEmitter.prototype);

module.exports.RuntimeContext = new RuntimeContext();

// Export available event names
module.exports.RuntimeEvents = runtimeEvents;