/*
  Card Layout based on Wookmark
  example:
  <div style="position:relative" ng-card-layout ng-items="posts">
    <ul>
      <li>...</li>
      ...
      <li>...</li>
    </ul>
  </div>
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
        link: function (scope, element) {
          var layout;

          function performLayout() {
            if (layout && layout.wookmarkInstance) {
              layout.wookmarkInstance.clear();
            }

            layout = element.find('> ul > li');
            layout.wookmark({
              autoResize: true,       // This will auto-update the layout when the browser window is resized.
              //direction: 'right',
              container: element,     // Optional, used for some extra CSS styling
              offset: 15,             // Optional, the distance between grid items
              outerOffset: 10,        // Optional, the distance to the containers border
              itemWidth: 450          // Optional, the width of a grid item
            });
          }

          scope.$watchCollection('ngItems', function () {
              $timeout(performLayout, 0);
            });
        }
      };
    }
  ]);