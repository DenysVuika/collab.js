/* Controls email settings for user Profile */
angular.module('collabjs.controllers')
  .controller('EmailController', ['$scope', '$timeout', '$http', 'accountService',
    function ($scope, $timeout, $http, accountService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      $scope.oldEmail = '';
      $scope.newEmail = '';
      $scope.confirmEmail = '';

      $scope.submit = function () {

        $scope.error = false;

        if (!$scope.oldEmail || !$scope.newEmail || !$scope.confirmEmail) {
          $scope.error = 'Incorrect email values.';
          return;
        }

        if ($scope.confirmEmail !== $scope.newEmail) {
          $scope.error = 'Email confirmation must match value above.';
          return;
        }

        if ($scope.newEmail === $scope.oldEmail) {
          $scope.error = 'New email is the same as old one.';
          return;
        }

        accountService
          .changeEmail($scope.oldEmail, $scope.newEmail)
          .then(
            // success handler
            function () {
              $scope.info = 'Email has been successfully changed.';
              $scope.oldEmail = $scope.newEmail;
              $scope.newEmail = '';
              $scope.confirmEmail = '';
            },
            // error handler
            function (err) {
              $scope.error = 'Error: ' + err;
              $scope.newEmail = '';
              $scope.confirmEmail = '';
            }
          );
      };

      accountService.getAccount().then(function (account) {
        $scope.oldEmail = account.email;
      });

    }]);