'use strict';

// Runtime context implementation

var events = require('events')
  , config = require('./config')
  , auth = require('./collabjs.auth')
  , data = require('./data');

var runtimeEvents = {
  app_init_static: 'app.init.static',
  app_init_routes: 'app.init.routes',
  app_start: 'app.start',
  userRegistered: 'user_registered@collab.js'
};

var RuntimeContext = function() {

  // Call the super constructor
  events.EventEmitter.call(this);

  this.events = runtimeEvents;
  this.config = config;
  this.auth = auth;
  this.data = data;

  // Return this object reference
  return (this);
};

// Extend runtime context class so that we can use on() and emit()
RuntimeContext.prototype = Object.create(events.EventEmitter.prototype);

module.exports.RuntimeContext = new RuntimeContext();

// Export available event names
module.exports.RuntimeEvents = runtimeEvents;