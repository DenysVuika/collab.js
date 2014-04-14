angular.module('collabjs.controllers')
  .controller('MenuController', ['$scope', 'authService', 'menuService',
    function ($scope, authService, menuService) {
      'use strict';

      $scope.visible = false;
      $scope.isAuthenticated = false;
      $scope.items = [];

      $scope.$on('$routeChangeSuccess', function () {
        var user = authService.getCurrentUser();
        if (user) {
          $scope.isAuthenticated = true;
          $scope.userName = user.name;
          $scope.userPictureUrl = user.pictureUrl;
          $scope.userAccount = user.account;

          // load menu items
          menuService.getMenuItems().then(function (items) {
            $scope.items = items || [];
          });
        } else {
          $scope.isAuthenticated = false;
          $scope.userName = null;
        }
      });
    }
  ]);