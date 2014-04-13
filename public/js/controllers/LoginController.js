angular.module('collabjs.controllers')
  .controller('LoginController', ['$scope', '$location', 'authService',
    function ($scope, $location, authService) {
      'use strict';

      $scope.loginErrorMsg = 'Incorrect username or password';
      $scope.error = false;
      $scope.username = '';
      $scope.password = '';

      $scope.reset = function () {
        $scope.username = '';
        $scope.password = '';
      };

      $scope.login = function () {
        authService
          .login($scope.username, $scope.password)
          .then(
            function () {
              $scope.reset();
              $location.url('/news');
            },
            function () {
              $scope.reset();
              $scope.error = $scope.loginErrorMsg;
            }
          );
      };

      $scope.logout = function () {
        authService.logout().then(function () { $location.url('/login'); });
      };
    }
  ]);