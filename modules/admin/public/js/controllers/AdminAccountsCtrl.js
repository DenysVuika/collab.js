angular.module('collabjs.controllers')
  .controller('AdminAccountsCtrl', ['$scope', 'adminService',
    function ($scope, adminService) {
      'use strict';

      $scope.accounts = [];

      $scope.init = function () {
        adminService.getAccounts().then(function (accounts) {
          $scope.accounts = accounts;
        });
      };
    }]);