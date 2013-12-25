/*
  Card Layout based on Wookmark
  example: <div class="cards-container" ng-card-layout ng-items="posts">...</div>
*/
angular.module('collabjs.directives')
  .directive('ngCardLayout', ['$timeout',
    function ($timeout) {
      'use strict';
      return {
        restrict: 'A',
        scope: {
          ngItems: '='
        },
        link: function (scope, element, attrs) {
          var layout, container;
          container = element.hasClass('cards-container') ? element : element.find('.cards-container');

          function performLayout() {
            if (layout && layout.wookmarkInstance) {
              layout.wookmarkInstance.clear();
            }

            layout = element.find('.cards li.card');
            layout.wookmark({
              // Prepare layout options
              autoResize: true, // This will auto-update the layout when the browser window is resized.
              //direction: 'right',
              container: container, // Optional, used for some extra CSS styling
              offset: 15, // Optional, the distance between grid items
              outerOffset: 10, // Optional, the distance to the containers border
              itemWidth: 450 // Optional, the width of a grid item
            });
          }

          scope.$watchCollection('ngItems', function () {
              $timeout(performLayout, 0);
            });
        }
      };
    }
  ]);