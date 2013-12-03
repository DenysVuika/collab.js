angular.module('collabjs.directives', [])
  .directive('sidebar', function ($location) {
    'use strict';
    return function(scope, element, attrs) {
      var links = element.find('a'),
        onClass = attrs.sidebar || 'on',
        subpaths = attrs.subpaths || false,
        routePattern,
        link,
        url,
        currentLink,
        urlMap = {},
        i;

      if (!$location.$$html5) {
        routePattern = /^\/#[^/]*/;
      }

      for (i = 0; i < links.length; i++) {
        link = angular.element(links[i]);
        //data-sidebar-subitems
        url = link.attr('href');

        if ($location.$$html5) {
          urlMap[url] = link;
        } else {
          urlMap[url.replace(routePattern, '')] = link;
        }
      }

      scope.$on('$routeChangeStart', function() {
        if (currentLink) {
          currentLink.removeClass(onClass);
        }

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
  });