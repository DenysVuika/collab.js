/*!
* collab.js v0.4.0
* Copyright (c) 2013 Denis Vuyka
* License: MIT
* http://www.opensource.org/licenses/mit-license.php
*/
angular.module('collabjs.directives')
  .directive('menubar', ['$location',
    function ($location) {
      'use strict';

      function mapLinks(element) {
        var links = element.find('a')
          , routePattern
          , link
          , url
          , urlMap = {}
          , i;

        if (!$location.$$html5) {
          routePattern = /^\/#[^/]*/;
        }

        for (i = 0; i < links.length; i++) {
          link = angular.element(links[i]);
          url = link.attr('href');

          if ($location.$$html5) {
            //urlMap[url] = link;
            urlMap[url] = link.parent();
          } else {
            //urlMap[url.replace(routePattern, '')] = link;
            urlMap[url.replace(routePattern, '')] = link.parent();
          }
        }

        return urlMap;
      }

      return function(scope, element, attrs) {
        var onClass = attrs.menubar || 'on'
          , subpaths = attrs.subpaths || false;

        //scope.$on('$routeChangeStart', function() { });

        scope.$on('$routeChangeSuccess', function () {

          element.find('li').removeClass(onClass);

          var urlMap = mapLinks(element);
          var pathLink = urlMap[$location.path()] || urlMap[$location.url()];

          // try only beginning of the url
          if (!pathLink && subpaths) {
            var path = $location.path();
            var parts = (path.indexOf('/') === 0 ? path.substr(1) : path).split('/');
            if (parts.length > 0) {
              pathLink = urlMap['/' + parts[0]];
            }
          }

          if (pathLink) {
            pathLink.addClass(onClass);
            if ($location.path() === '/search') {
              pathLink.parents('li').addClass(onClass);
            }
          }
        });
      };
    }]);
/*
  Card Layout based on Wookmark
  example: <div class="cards-container" ng-card-layout ng-items="posts"></div>
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
angular.module('collabjs.directives')
  .directive('sidebar', ['$location',
    function ($location) {
      'use strict';

      function mapLinks(element) {
        var links = element.find('a')
          , routePattern
          , link
          , url
          , urlMap = {}
          , i;

        if (!$location.$$html5) {
          routePattern = /^\/#[^/]*/;
        }

        for (i = 0; i < links.length; i++) {
          link = angular.element(links[i]);
          url = link.attr('href');

          if ($location.$$html5) {
            urlMap[url] = link;
          } else {
            urlMap[url.replace(routePattern, '')] = link;
          }
        }

        return urlMap;
      }
    
      return function(scope, element, attrs) {
        var onClass = attrs.sidebar || 'on'
          , subpaths = attrs.subpaths || false
          , currentLink;

        //scope.$on('$routeChangeStart', function() { });

        scope.$on('$routeChangeSuccess', function () {
          if (currentLink) {
            currentLink.removeClass(onClass);
          }

          var urlMap = mapLinks(element);
          var pathLink = urlMap[$location.path()] || urlMap[$location.url()];

          // try only beginning of the url
          if (!pathLink && subpaths) {
            var path = $location.path();
            var parts = (path.indexOf('/') === 0 ? path.substr(1) : path).split('/');
            if (parts.length > 0) {
              pathLink = urlMap['/' + parts[0]];
            }
          }

          if (pathLink) {
            currentLink = pathLink;
            currentLink.addClass(onClass);
          }
        });
      };
    }]);