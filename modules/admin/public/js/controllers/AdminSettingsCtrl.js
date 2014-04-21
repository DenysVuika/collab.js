angular.module('collabjs.controllers')
  .controller('AdminSettingsCtrl', ['$scope', 'isAdmin',
    function ($scope, isAdmin) {
      'use strict';
      $scope.templateUrl = isAdmin ? '/admin/templates/index.html' : '/templates/403.html';
    }]);