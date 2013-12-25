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