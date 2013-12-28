angular.module('collabjs.controllers')
  .controller('MenuController', ['$scope', 'authService', 'searchService',
    function ($scope, authService, searchService) {
      'use strict';

      $scope.visible = false;
      $scope.searchLists = [];
      $scope.isAuthenticated = false;

      $scope.$on('$routeChangeSuccess', function () {
        var user = authService.getCurrentUser();
        if (user) {
          $scope.isAuthenticated = true;
          $scope.userName = user.name;

          // TODO: optimize (called on every route change)
          searchService.getLists().then(
            function (data) {
              $scope.searchLists = data || [];
            }
          );
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