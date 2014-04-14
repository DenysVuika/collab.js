/* Controls email settings for user Profile */
angular.module('collabjs.controllers')
  .controller('EmailController', ['$scope', 'accountService',
    function ($scope, accountService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      $scope.oldEmail = '';
      $scope.newEmail = '';
      $scope.confirmEmail = '';

      $scope.errInvalidValues = 'Incorrect email values.';
      $scope.errConfirmation = 'Email confirmation must match value above.';
      $scope.errSameEmail = 'New email is the same as old one.';
      $scope.msgSuccess = 'Email has been successfully changed.';

      $scope.init = function () {
        accountService.getAccount().then(function (account) {
          $scope.oldEmail = account.email;
        });
      };

      $scope.submit = function () {

        $scope.error = false;

        if (!$scope.oldEmail || !$scope.newEmail || !$scope.confirmEmail) {
          $scope.error = $scope.errInvalidValues;
          return;
        }

        if ($scope.confirmEmail !== $scope.newEmail) {
          $scope.error = $scope.errConfirmation;
          return;
        }

        if ($scope.newEmail === $scope.oldEmail) {
          $scope.error = $scope.errSameEmail;
          return;
        }

        accountService
          .changeEmail($scope.oldEmail, $scope.newEmail)
          .then(
            // success handler
            function () {
              $scope.info = $scope.msgSuccess;
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
    }]);