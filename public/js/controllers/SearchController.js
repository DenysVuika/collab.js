angular.module('collabjs.controllers')
  .controller('SearchController', ['$scope', '$routeParams', 'searchService',
    function ($scope, $routeParams, searchService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      $scope.query = $routeParams.q || null;
      $scope.source = $routeParams.src || 'unknown';
      $scope.isSaved = null;
      $scope.hasNoPosts = null;
      $scope.posts = [];
      $scope.isLoadingMorePosts = false;

      $scope.canWatch = function () {
        return $scope.isSaved !== null && !$scope.isSaved && !$scope.hasNoPosts;
      };

      $scope.canUnwatch = function () {
        return $scope.isSaved;
      };

      searchService.searchPosts($scope.query, $scope.source).then(function (data) {
        $scope.isSaved = data.isSaved;
        $scope.posts = data.entries;
        $scope.hasNoPosts = ($scope.posts.length === 0);
      });

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      $scope.watch = function () {
        searchService
          .saveList($scope.query, $scope.source)
          .then(
          function () {
            $scope.isSaved = true;
            $scope.info = 'Search list was successfully saved.';
          },
          function (err) { $scope.error = err; }
        );
      };

      $scope.unwatch = function () {
        searchService
          .deleteList($scope.query, $scope.source)
          .then(
          function () {
            $scope.isSaved = false;
            $scope.info = 'Search list was successfully removed.';
          },
          function (err) { $scope.error = err; }
        );
      };

      $scope.loadMorePosts = function () {
        if ($scope.isLoadingMorePosts) { return; }
        $scope.isLoadingMorePosts = true;

        var bottomPostId = null;
        if ($scope.posts.length > 0) {
          bottomPostId = Math.min.apply(this, $.map($scope.posts, function (p) {
            return p.id;
          }));
        }

        searchService.searchPosts($scope.searchQuery, $scope.searchSource, bottomPostId).then(function (data) {
          $scope.posts.push.apply($scope.posts, data || []);
          $scope.isLoadingMorePosts = false;
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };
    }
  ]);