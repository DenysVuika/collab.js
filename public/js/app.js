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

    var isAdmin = function ($q, $timeout, $http, $location, authService) {
      var d = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/api/auth/check').success(function(user){
        // Authenticated
        if (user !== '0') {
          authService.setCurrentUser(user);

          if (user.roles && user.roles.indexOf('administrator') > -1) {
            $timeout(function() { d.resolve(true); }, 0);
          } else {
            $timeout(function() { d.resolve(false); }, 0);
          }
        }
        // Not Authenticated
        else {
          authService.setCurrentUser(null);
          $timeout(function(){ d.reject(null); }, 0);
          $location.url('/login');
        }
      });

      return d.promise;
    };

    /*var canRegister = function ($q, $timeout, $location) {
      if (collabjs.allowUserRegistration) {
        return true;
      }


    };*/

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

            if ($location.path() === '/register' && !collabjs.config.allowUserRegistration) {
              $location.path('/').replace();
            }
            //$timeout(function(){ deferred.reject(null); }, 0);
            //$location.url('/login')
          }
        });
      }
      return deferred.promise;
    };

    collabjs.auth = auth;
    collabjs.defaultRedirect = defaultRedirect;
    collabjs.isAdmin = isAdmin;

    $routeProvider
      // allows controller assigning template url dynamically via '$scope.templateUrl'
      //.when('/news', { template: '<div ng-include="templateUrl"></div>', controller: 'NewsController' })
      .when('/', {
        templateUrl: '/templates/index.html',
        resolve: { isLoggedIn: defaultRedirect },
        title: 'Welcome'
      })
      .when('/login', {
        templateUrl: '/templates/login.html',
        controller: 'LoginController',
        resolve: { isLoggedIn: defaultRedirect },
        title: 'Sign In'
      })
      .when('/register', {
        templateUrl: '/templates/register.html',
        controller: 'RegistrationController',
        resolve: { isLoggedIn: defaultRedirect },
        title: 'Register'
      })
      .when('/news', {
        templateUrl: '/templates/news.html',
        controller: 'NewsController',
        resolve: { isLoggedIn: auth },
        title: 'News'
      })
      .when('/explore/:tag?', {
        templateUrl: '/templates/explore.html',
        controller: 'ExploreController',
        resolve: { isLoggedIn: auth },
        title: 'Explore'
      })
      .when('/people', {
        templateUrl: '/templates/people.html',
        controller: 'PeopleListController',
        resolve: { isLoggedIn: auth },
        title: 'People'
      })
      .when('/people/:account', {
        templateUrl: '/templates/wall.html',
        controller: 'WallController',
        resolve: { isLoggedIn: auth },
        title: 'Account'
      })
      .when('/people/:account/following', {
        templateUrl: '/templates/following.html',
        controller: 'FollowingController',
        resolve: { isLoggedIn: auth },
        title: 'Following'
      })
      .when('/people/:account/followers', {
        templateUrl: '/templates/followers.html',
        controller: 'FollowersController',
        resolve: { isLoggedIn: auth },
        title: 'Followers'
      })
      .when('/posts/:postId', {
        templateUrl: '/templates/post.html',
        controller: 'PostController',
        resolve: { isLoggedIn: auth },
        title: 'Post'
      })
      .when('/account', {
        templateUrl: '/templates/account-profile.html',
        controller: 'AccountController',
        resolve: { isLoggedIn: auth },
        title: 'Profile'
      })
      .when('/account/password', {
        templateUrl: '/templates/account-password.html',
        controller: 'PasswordController',
        resolve: { isLoggedIn: auth },
        title: 'Change Password'
      })
      .when('/help/:article?', {
        templateUrl: '/templates/help.html',
        controller: 'HelpController',
        title: 'Help'
      })
      .otherwise({ redirectTo: '/news' });
  }])
  .run(function ($rootScope) {
    'use strict';

    // synchronize page title with current route title
    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute/*, previousRoute */) {
      $rootScope.title = currentRoute.title;
    });
  });

angular.module('collabjs.services', ['ngResource']);
angular.module('collabjs.directives', []);
angular.module('collabjs.filters', []);
angular.module('collabjs.controllers', []);