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