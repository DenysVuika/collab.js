angular.module('collabjs.controllers')
  .controller('WallController', ['$scope', '$routeParams', 'postsService',
    function ($scope, $routeParams, postsService) {
      'use strict';

      $scope.error = false;
      $scope.posts = [];
      $scope.hasNoPosts = false;
      $scope.isLoadingMorePosts = false;
      $scope.errNotFound = 'THE RESOURCE YOU ARE LOOKING FOR HAS BEEN REMOVED, HAD ITS NAME CHANGED, OR IS TEMPORARILY UNAVAILABLE.';

      // allows switching on/off various context menu actions
      $scope.contextMenuOptions = {
        allowMute: false  // switches off 'Mute' action for Wall guests
      };

      $scope.init = function () {
        $scope.account = $routeParams.account;
        postsService.getWall($scope.account).then(
          // success handler
          function (data) {
            $scope.profile = data.user;
            if (data.feed && data.feed.length > 0) {
              $scope.posts = data.feed;
            }
            $scope.hasNoPosts = ($scope.posts.length === 0);
          },
          // error handler
          function () {
            $scope.error = $scope.errNotFound;
          });
      };

      $scope.loadMorePosts = function () {
        if ($scope.isLoadingMorePosts) { return; }
        $scope.isLoadingMorePosts = true;

        var bottomPostId = 0;
        if ($scope.posts.length > 0) {
          bottomPostId = Math.min.apply(this, $.map($scope.posts, function (p) {
            return p.id;
          }));
        }

        postsService.getWall($scope.account, bottomPostId).then(function (data) {
          $scope.posts.push.apply($scope.posts, data.feed || []);
          $scope.isLoadingMorePosts = false;
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };
    }
  ]);