angular.module('collabjs.controllers')
  .controller('LoginController', ['$scope', '$location', 'authService',
    function ($scope, $location, authService) {
      'use strict';

      $scope.error = false;
      $scope.username = '';
      $scope.password = '';

      function reset() {
        $scope.username = '';
        $scope.password = '';
      }

      $scope.login = function () {
        authService
          .login($scope.token, $scope.username, $scope.password)
          .then(
            function () {
              reset();
              $location.url('/news');
            },
            function () {
              reset();
              $scope.error = 'Incorrect username or password';
            }
          );
      };

      $scope.logout = function () {
        authService
          .logout($scope.token)
          .then(function () {
            $location.url('/login');
          });
      };
    }
  ]);