angular.module('collabjs.directives')
  .directive('sidebar', ['$location', '$timeout',
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

        function updateSelection() {
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
            currentLink = pathLink;
            currentLink.addClass(onClass);
          }
        }

        scope.$on('$routeChangeSuccess', function () {
          updateSelection();
        });

        $timeout(updateSelection, 0);
      };
    }]);