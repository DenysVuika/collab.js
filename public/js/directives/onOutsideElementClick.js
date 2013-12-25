angular.module('collabjs.directives')
  .directive('onOutsideElementClick', ['$document',
    function ($document) {
      'use strict';
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.bind('click', function (e) {
            e.stopPropagation();
          });

          $document.on('click', function () {
            scope.$apply(function () {
              scope.$eval(attrs.onOutsideElementClick);
            });
          });
        }
      };
    }
  ]);