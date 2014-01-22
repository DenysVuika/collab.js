angular.module('collabjs', [
    'ngRoute',
    'ngSanitize',
    'collabjs.services',
    'collabjs.filters',
    'collabjs.directives',
    'collabjs.controllers',
    'angularMoment',
    'infinite-scroll',
    'ui.select2',
    'chieffancypants.loadingBar',
    'ngAnimate'
  ])
  .config(['$routeProvider', function ($routeProvider) {
    'use strict';

    var auth = function($q, $timeout, $http, $location, authService){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/api/auth/check').success(function(user){
        // Authenticated
        if (user !== '0') {
          authService.setCurrentUser(user);
          $timeout(deferred.resolve, 0);
        }
        // Not Authenticated
        else {
          authService.setCurrentUser(null);
          $timeout(function(){ deferred.reject(null); }, 0);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };

    var defaultRedirect = function ($q, $http, $location, $timeout, authService) {
      var deferred = $q.defer();
      var user = authService.getCurrentUser();
      if (user) {
        $location.path('/news').replace();
        $timeout(deferred.resolve, 0);
      } else {
        // Make an AJAX call to check if the user is logged in
        $http.get('/api/auth/check').success(function(user){
          // Authenticated
          if (user !== '0') {
            authService.setCurrentUser(user);
            $timeout(deferred.resolve, 0);
            $location.path('/news').replace();
          }
          // Not Authenticated
          else {
            authService.setCurrentUser(null);
            $timeout(deferred.resolve, 0);
            //$timeout(function(){ deferred.reject(null); }, 0);
            //$location.url('/login')
          }
        });
      }
      return deferred.promise;
    };

    $routeProvider
      // allows controller assigning template url dynamically via '$scope.templateUrl'
      //.when('/news', { template: '<div ng-include="templateUrl"></div>', controller: 'NewsController' })
      .when('/', {
        templateUrl: '/partials/index',
        resolve: { isLoggedIn: defaultRedirect }
      })
      .when('/login', {
        templateUrl: '/templates/login.html',
        controller: 'LoginController',
        resolve: { isLoggedIn: defaultRedirect }
      })
      .when('/register', {
        templateUrl: '/templates/register.html',
        controller: 'RegistrationController',
        resolve: { isLoggedIn: defaultRedirect }
      })
      .when('/news', {
        templateUrl: '/partials/news',
        controller: 'NewsController',
        resolve: { isLoggedIn: auth }
      })
      .when('/people', {
        templateUrl: '/templates/people.html',
        controller: 'PeopleListController',
        resolve: { isLoggedIn: auth }
      })
      .when('/people/:account', {
        templateUrl: '/partials/wall',
        controller: 'WallController',
        resolve: { isLoggedIn: auth }
      })
      .when('/people/:account/following', {
        templateUrl: '/templates/following.html',
        controller: 'FollowingController',
        resolve: { isLoggedIn: auth }
      })
      .when('/people/:account/followers', {
        templateUrl: '/templates/followers.html',
        controller: 'FollowersController',
        resolve: { isLoggedIn: auth }
      })
      .when('/mentions', {
        templateUrl: '/partials/mentions',
        controller: 'MentionsController',
        resolve: { isLoggedIn: auth }
      })
      .when('/posts/:postId', {
        templateUrl: '/partials/post',
        controller: 'PostController',
        resolve: { isLoggedIn: auth }
      })
      .when('/account', {
        templateUrl: '/partials/account',
        controller: 'AccountController',
        resolve: { isLoggedIn: auth }
      })
      .when('/account/password', {
        templateUrl: '/partials/password',
        controller: 'PasswordController',
        resolve: { isLoggedIn: auth }
      })
      .when('/search', {
        templateUrl: '/partials/search',
        controller: 'SearchController',
        resolve: { isLoggedIn: auth }
      })
      .when('/help/:article?', {
        templateUrl: '/templates/help.html',
        controller: 'HelpController'
      })
      .otherwise({ redirectTo: '/news' });
  }]);

angular.module('collabjs.services', ['ngResource']);
angular.module('collabjs.directives', []);
angular.module('collabjs.filters', []);
angular.module('collabjs.controllers', []);