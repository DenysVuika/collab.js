angular.module('collabjs.controllers')
  .controller('NewsController', ['$scope', '$compile', '$timeout', 'postsService', 'profileService',
    function ($scope, $compile, $timeout, postsService, profileService) {
      'use strict';
      var cardLayout = true;
      $scope.templateUrl = cardLayout ? '/partials/news-cards' : '/partials/news-list';
      $scope.posts = [];
      $scope.hasNoPosts = false;
      $scope.newPostsCount = 0;
      var layout;
      var _updateChecker;

      function initWookmark() {

        if (layout && layout.wookmarkInstance) {
          layout.wookmarkInstance.clear();
        }

        layout = angular.element('.cards li.card');

        layout.wookmark({
          // Prepare layout options
          autoResize: true, // This will auto-update the layout when the browser window is resized.
          //direction: 'right',
          container: angular.element('.cards-container'), // Optional, used for some extra CSS styling
          offset: 15, // Optional, the distance between grid items
          outerOffset: 10, // Optional, the distance to the containers border
          itemWidth: 450 // Optional, the width of a grid item
        });
      }

      $scope.$watchCollection('posts', function () {
        if (cardLayout) {
          $timeout(initWookmark, 0);
        }
      });

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

      // TODO: move to CardController
      $scope.mutePost = function (postId) {
        if (postId) {
          // remove post on server
          postsService.deletePost(postId, $scope.token).then(function () {
            // on successful removal update the client side collection
            var post = $scope.posts.filter(function (p) { return p.id === postId; });
            if (post.length > 0) {
              var i = $scope.posts.indexOf(post[0]);
              if (i > -1) {
                $scope.posts.splice(i, 1);
                // TODO: replace with collection watching
                $scope.hasNoPosts = ($scope.posts.length === 0);
              }
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