angular.module('collabjs.controllers')
  .controller('SearchController', ['$scope', '$routeParams', 'searchService', 'postsService', 'profileService',
    function ($scope, $routeParams, searchService, postsService, profileService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      $scope.query = $routeParams.q || null;
      $scope.source = $routeParams.src || 'unknown';
      $scope.isSaved = null;
      $scope.hasNoPosts = null;
      $scope.posts = [];

      $scope.canSave = function () {
        return $scope.isSaved !== null && !$scope.isSaved && !$scope.hasNoPosts;
      };

      $scope.canRemove = function () {
        return $scope.isSaved;
      };

      searchService.searchPosts($scope.query, $scope.source).then(function (data) {
        $scope.isSaved = data.isSaved;
        $scope.posts = data.entries;
        $scope.hasNoPosts = ($scope.posts.length === 0);
      });

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      $scope.profilePictureUrl = profileService.profilePictureUrl();
      $scope.getPostUrl = postsService.getPostUrl;
      $scope.loadPostComments = postsService.loadPostComments;

      $scope.saveList = function () {
        searchService
          .saveList($scope.token, $scope.query, $scope.source)
          .then(
          function () {
            $scope.isSaved = true;
            $scope.info = 'Search list was successfully saved.';
          },
          function (err) { $scope.error = err; }
        );
      };

      $scope.deleteList = function () {
        searchService
          .deleteList($scope.token, $scope.query, $scope.source)
          .then(
          function () {
            $scope.isSaved = false;
            $scope.info = 'Search list was successfully removed.';
          },
          function (err) { $scope.error = err; }
        );
      };

      $scope.deletePost = function (post) {
        if (post) {
          postsService.deletePost(post.id, $scope.token).then(function () {
            var i = $scope.posts.indexOf(post);
            if (i >-1) {
              $scope.posts.splice(i, 1);
              $scope.hasNoPosts = ($scope.posts.length === 0);
            }
          });
        }
      };

      $scope.isLoadingMorePosts = false;

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