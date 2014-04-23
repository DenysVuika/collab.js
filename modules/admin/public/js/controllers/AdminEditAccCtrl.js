angular.module('collabjs.controllers')
  .controller('AdminEditAccCtrl', ['$scope', 'adminService', 'isAdmin',
    function ($scope, adminService, isAdmin) {
      'use strict';
      // TODO: automate this
      $scope.templateUrl = isAdmin ? '/admin/templates/account-edit.html' : '/templates/403.html';
    }]);