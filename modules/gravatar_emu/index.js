'use strict';

/*
  Simple gravatar emulator for development purposes.
  Typically used for offline development and testing of collab.js timeline.
  Please change your configuration settings in order to enable it:
    config.env.avatarServer = 'http://127.0.0.1:3000';
 */

module.exports = function (context) {
  context.once('app.init.routes', function (app) {
    app.get('/avatar/:id?', function (req, res) {
      res.sendfile(__dirname + '/public/img/avatar.png');
    });
  });
};