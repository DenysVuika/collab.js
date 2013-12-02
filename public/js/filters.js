angular.module('collabjs.filters', [])
  .filter('twitterize', function ($sce) {
    'use strict';
    return function(input) {
      if (input && input.length > 0) {
        // TODO: move implementation inside the filter
        return $sce.trustAsHtml(input.twitterize());
      }
      return null;
    };
  })
  .filter('wallUrl', function () {
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
  });