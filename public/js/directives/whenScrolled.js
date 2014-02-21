angular.module('collabjs.directives')
  .directive('whenScrolled', ['$rootScope', function ($rootScope) {
    'use strict';
    return function (scope, element, attrs) {
      var container = angular.element(document.body).find('.container');
      var raw = container[0];
      /*var scrollOffset = 200;*/

      var handler = function () {
        if (raw.scrollTop + raw.offsetHeight >= (raw.scrollHeight /*- scrollOffset*/)) {
          if ($rootScope.$$phase) {
            return scope.$eval(attrs.whenScrolled);
          } else {
            return scope.$apply(attrs.whenScrolled);
          }
        }
        return true;
      };

      container.on('scroll', handler);
      scope.$on('$destroy', function () {
        container.off('scroll', handler);
      });
    };
  }]);