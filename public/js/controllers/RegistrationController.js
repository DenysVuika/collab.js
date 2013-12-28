angular.module('collabjs.controllers')
  .controller('RegistrationController', ['$scope', '$location', 'accountService',
    function ($scope, $location, accountService) {
      'use strict';

      $scope.error = false;
      $scope.dismissError = function () { $scope.error = false; };

      $scope.account = '';
      $scope.name = '';
      $scope.email = '';
      $scope.password = '';
      $scope.confirmPassword = '';

      $scope.register = function () {
        accountService
          .createAccount($scope.token, $scope.account, $scope.name, $scope.email, $scope.password)
          .then(
            function () { $location.path('/').replace(); },
            function (err) {
              $scope.error = err;
              $scope.password = '';
              $scope.confirmPassword = '';
            }
          );
      };
    }]);