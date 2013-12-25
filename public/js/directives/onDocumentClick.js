angular.module('collabjs.directives')
  .directive('onDocumentClick', ['$document',
    function ($document) {
      'use strict';
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          $document.on('click', function () {
            scope.$apply(function () {
              scope.$eval(attrs.onDocumentClick);
            });
          });
        }
      };
    }
  ]);