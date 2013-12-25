angular.module('collabjs.controllers')
  .controller('MenuController', ['$scope', 'searchService',
    function ($scope, searchService) {
      'use strict';

      $scope.searchLists = [];

      searchService.getLists().then(
        function (data) {
          $scope.searchLists = data || [];
        }
      );

      /*
       $scope.$on('destroy', function () {
       console.log('SearchController is destroyed.');
       });
       */

      $scope.$on('listSaved@searchService', function (e, list) {
        $scope.searchLists.push(list);
      });

      $scope.$on('listDeleted@searchService', function (e, list) {
        $scope.searchLists =  $scope.searchLists.filter(function (element) {
          return element.q !== list.q;
        });
      });
    }
  ]);