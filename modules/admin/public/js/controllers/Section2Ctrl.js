angular.module('collabjs.controllers')
  .controller('Section2Ctrl', ['$scope', 'isAdmin',
    function ($scope, isAdmin) {
      'use strict';
      // TODO: automate this
      $scope.templateUrl = isAdmin ? '/admin/templates/section2.html' : '/templates/403.html';
    }]);