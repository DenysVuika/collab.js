/*!
* collab.js v0.5.0-alpha
* Copyright (c) 2013-2014 Denis Vuyka
* License: MIT
* http://www.opensource.org/licenses/mit-license.php
*/
angular.module('collabjs.filters')
  .filter('twitterize', ['$sce',
    function ($sce) {
      'use strict';
      return function(input) {
        if (input && input.length > 0) {
          // TODO: move implementation inside the filter
          return $sce.trustAsHtml(input.twitterize());
        }
        return null;
      };
    }
  ]);
angular.module('collabjs.filters')
  .filter('wallUrl', [
    function () {
      'use strict';
      return function (input) {
        if (typeof input === 'string') {
          return '/#/people/' + input;
        }
        if (input && input.account) {
          return '/#/people/' + input.account;
        }
        return null;
      };
    }
  ]);