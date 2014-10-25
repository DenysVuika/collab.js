angular.module('collabjs.directives')
  .directive('menubar', ['$location', '$timeout',
    function ($location, $timeout) {
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

        function updateSelection() {
          element.find('li').removeClass(onClass);

          var urlMap = mapLinks(element);
          var pathLink = urlMap[$location.path()] || urlMap[$location.url()];

          // try only beginning of the url
          if (!pathLink && subpaths) {
            var path = $location.path();
            var parts = (path.indexOf('/') === 0 ? path.substr(1) : path).split('/');
            if (parts.length > 0) {
              if (parts.length > 1) {
                for (var i = parts.length - 1; i >= 0; i--) {
                  var upperLevel = '/' + parts.slice(0, i).join('/');
                  pathLink = urlMap[upperLevel];
                  if (pathLink) {
                    break;
                  }
                }
              } else {
                pathLink = urlMap['/' + parts[0]];
              }
            }
          }

          if (pathLink) {
            pathLink.addClass(onClass);
            if ($location.path() === '/search') {
              pathLink.parents('li').addClass(onClass);
            }
          }
        }

        scope.$on('$routeChangeSuccess', function () {
          updateSelection();
        });

        $timeout(updateSelection, 0);
      };
    }]);