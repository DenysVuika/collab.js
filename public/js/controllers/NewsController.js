angular.module('collabjs.controllers')
  .controller('NewsController', ['$scope', '$compile', '$timeout', 'postsService', 'profileService',
    function ($scope, $compile, $timeout, postsService, profileService) {
      'use strict';
      // temp flag used during layout migration
      var cardLayout = true;
      $scope.templateUrl = cardLayout ? '/partials/news-cards' : '/partials/news-list';
      $scope.posts = [];
      $scope.hasNoPosts = false;
      $scope.newPostsCount = 0;
      var _updateChecker;

      $scope.profilePictureUrl = profileService.profilePictureUrl();
      $scope.getPostUrl = postsService.getPostUrl;
      // TODO: used by old layout
      $scope.loadPostComments = postsService.loadPostComments;

      // TODO: used by old layout
      $scope.deletePost = function (post) {
        if (post) {
          postsService.deletePost(post.id, $scope.token).then(function () {
            var i = $scope.posts.indexOf(post);
            if (i > -1) {
              $scope.posts.splice(i, 1);
              // TODO: replace with collection watching
              $scope.hasNoPosts = ($scope.posts.length === 0);
            }
          });
        }
      };

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