angular.module('collabjs.controllers')
  .controller('MenuController', ['$scope', 'authService', 'menuService', 'searchService',
    function ($scope, authService, menuService, searchService) {
      'use strict';

      $scope.visible = false;
      $scope.searchLists = [];
      $scope.isAuthenticated = false;
      $scope.items = [];

      $scope.$on('$routeChangeSuccess', function () {
        var user = authService.getCurrentUser();
        if (user) {
          $scope.isAuthenticated = true;
          $scope.userName = user.name;
          $scope.userPictureUrl = user.pictureUrl;
          $scope.userAccount = user.account;

          // TODO: optimize (called on every route change)
          searchService.getLists().then(
            function (data) {
              $scope.searchLists = data || [];
            }
          );

          // load menu items
          menuService.getMenuItems().then(function (items) {
            $scope.items = items || [];
          });

        } else {
          $scope.isAuthenticated = false;
          $scope.userName = null;
        }
      });


      $scope.$on('listSaved@searchService', function (e, list) {
        $scope.searchLists.push(list);
      });

      $scope.$on('listDeleted@searchService', function (e, list) {
        $scope.searchLists =  $scope.searchLists.filter(function (element) {
          return element.q !== list.q;
        });
      });

      /*
       $scope.$on('destroy', function () {
       console.log('SearchController is destroyed.');
       });
       */
    }
  ]);