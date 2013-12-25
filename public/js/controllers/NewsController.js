angular.module('collabjs.controllers')
  .controller('NewsController', ['$scope', '$timeout', 'postsService',
    function ($scope, $timeout, postsService) {
      'use strict';
      $scope.posts = [];
      $scope.canUpdateStatus = true;
      $scope.hasNoPosts = false;
      $scope.newPostsCount = 0;
      var _updateChecker;

      $scope.loadNewPosts = function () {
        $timeout.cancel(_updateChecker);
        // TODO: check the case when no posts are loaded
        var topId = Math.max.apply(this, $.map($scope.posts, function(p) { return p.id; }));

        postsService
          .getNewsUpdates(topId)
          .then(function (data) {
            $scope.posts.push.apply($scope.posts, data || []);
            $scope.newPostsCount = 0;
            $scope.checkNewPosts();
          });
      };

      $scope.checkNewPosts = function () {
        $timeout.cancel(_updateChecker);
        _updateChecker = $timeout(function () {
          // TODO: check the case when no posts are loaded
          var topId = Math.max.apply(this, $.map($scope.posts, function(p) { return p.id; }));
          postsService
            .getNewsUpdatesCount(topId)
            .then(function (count) {
              $scope.newPostsCount = count;
              $scope.checkNewPosts();
            });
        }, 60000); // once per minute
        //}, 6000); // once per 6 seconds (debugging)
      };

      $scope.isLoadingMorePosts = false;

      $scope.loadMorePosts = function () {
        if ($scope.isLoadingMorePosts) { return; }
        $scope.isLoadingMorePosts = true;

        var bottomPostId = 0;
        if ($scope.posts.length > 0) {
          bottomPostId = Math.min.apply(this, $.map($scope.posts, function (p) { return p.id; }));
        }

        postsService.getNews(bottomPostId).then(function (data) {
          $scope.posts.push.apply($scope.posts, data || []);
          $scope.isLoadingMorePosts = false;
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };

      postsService.getNews().then(function (data) {
        $scope.posts = data;
        $scope.hasNoPosts = (data.length === 0);
      });

      // start monitoring new updates
      $scope.checkNewPosts();
    }
  ]);