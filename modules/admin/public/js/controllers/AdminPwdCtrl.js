angular.module('collabjs.controllers')
  .controller('AdminPwdCtrl', ['$scope', '$routeParams', '$location', 'adminService',
    function ($scope, $routeParams, $location, adminService) {
      'use strict';

      $scope.error = false;
      $scope.account = '';
      $scope.password = '';
      $scope.confirmPassword = '';

      $scope.init = function () {
        $scope.account = $routeParams.account;
      };

      $scope.change = function () {
        // TODO: add validation
        adminService
          .changePassword($scope.account, $scope.password)
          .then(
            function () {
              $location.path('/admin/accounts/a/' + $scope.account).replace();
            },
            function (err) {
              $scope.error = err;
            }
          );
      };
    }]);