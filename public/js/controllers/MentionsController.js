angular.module('collabjs.controllers')
  .controller('MentionsController', ['$scope', 'postsService', 'profileService',
    function ($scope, postsService, profileService) {
      'use strict';

      $scope.posts = [];
      // user has no posts to display
      $scope.hasNoPosts = false;

      postsService.getMentions().then(function (data) {
        if (data.feed && data.feed.length > 0) {
          $scope.posts = data.feed;
        }
        $scope.hasNoPosts = ($scope.posts.length === 0);
      });

      $scope.profilePictureUrl = profileService.profilePictureUrl();
      $scope.getPostUrl = postsService.getPostUrl;
      $scope.loadPostComments = postsService.loadPostComments;

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
    }
  ]);