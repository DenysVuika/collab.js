angular.module('collabjs', [
  'ngRoute',
  'ngSanitize',
  'collabjs.services',
  'collabjs.filters',
  'collabjs.directives',
  'angularMoment',
  'infinite-scroll',
  'ui.select2'])
  .config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider
      .when('/news', { templateUrl: '/partials/news' })
      .when('/people', { templateUrl: '/partials/people' })
      .when('/people/:account', { templateUrl: '/partials/wall' })
      .when('/people/:account/following', { templateUrl: '/partials/following' })
      .when('/people/:account/followers', { templateUrl: '/partials/followers' })
      .when('/mentions', { templateUrl: '/partials/mentions' })
      .when('/posts/:postId', { templateUrl: '/partials/post' })
      .when('/account', { templateUrl: '/partials/account' })
      .when('/account/password', { templateUrl: '/partials/password' })
      .otherwise({ redirectTo: '/news' });
  }]);