angular.module('collabjs.controllers')
  .controller('MentionsController', ['$scope', 'postsService',
    function ($scope, postsService) {
      'use strict';
      $scope.posts = [];
      $scope.hasNoPosts = false;
      $scope.isLoadingMorePosts = false;

      $scope.loadMorePosts = function () {
        if ($scope.isLoadingMorePosts) { return; }
        $scope.isLoadingMorePosts = true;

        var bottomPostId = 0;
        if ($scope.posts.length > 0) {
          bottomPostId = Math.min.apply(this, $.map($scope.posts, function (p) {
            return p.id;
          }));
        }

        postsService.getMentions(bottomPostId).then(function (data) {
          $scope.posts.push.apply($scope.posts, data || []);
          $scope.isLoadingMorePosts = false;
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };

      postsService.getMentions().then(function (data) {
        if (data.feed && data.feed.length > 0) {
          $scope.posts = data.feed;
        }
        $scope.hasNoPosts = ($scope.posts.length === 0);
      });
    }
  ]);