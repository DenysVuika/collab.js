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