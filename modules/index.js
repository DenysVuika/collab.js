'use strict';

var fs = require('fs')
  , path = require('path')
  , debug = require('debug')('collabjs:modules');

/*
module.exports = function(context) {
  console.log('Starting external modules...');
  fs.readdirSync(__dirname).forEach(function(file) {
    if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js') {
      return;
    }
    var name = file.substr(0, file.indexOf('.'));
    require('./' + name)(context);
  });
};
*/

module.exports = function(context) {
  debug('Starting external modules...');
  fs.readdirSync(__dirname).forEach(function(file) {
    var currentFile = path.join(__dirname, file);
    var stats = fs.statSync(currentFile);
    if (stats.isDirectory()) {
      debug('Loading module ' + file);
      require(currentFile)(context);
    }
  });
};