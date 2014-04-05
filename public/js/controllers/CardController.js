/*
 Single card controller (used as a child of NewsController)
 */
angular.module('collabjs.controllers')
  .controller('CardController', ['$scope', '$timeout', '$location', 'authService', 'postsService', 'dialogService',
    function ($scope, $timeout, $location, authService, postsService, dialogService) {
      'use strict';

      $scope.commentsExpanded = false;
      $scope.comment = '';

      $scope.init = function (post) {
        $scope.post = post;
        $scope.contextActions = getContextActions(post);
      };

      $scope.toggleComments = function ($event) {
        if ($scope.commentsExpanded) {
          $scope.commentsExpanded = false;
          updateCardLayout($event.currentTarget);
        } else {
          postsService.loadPostComments($scope.post, function () {
            $scope.commentsExpanded = true;
            updateCardLayout($event.currentTarget);
          });
        }
      };

      // update card layout based on an element inside it
      function updateCardLayout(element) {
        $timeout(function () {
          $(element).parents('.card').trigger('refreshWookmark');
        }, 0);
      }

      $scope.postComment = function ($event) {
        if ($scope.comment && $scope.comment.length > 0) {
          postsService
            .addComment($scope.post.id, $scope.comment)
            .then(function (comment) {
              var comments = $scope.post.comments || [];
              comments.push(comment);
              $scope.post.comments = comments;
              $scope.post.commentsCount++;
              $scope.comment = null;
              updateCardLayout($event.currentTarget);
            });
        }
      };

      // Context Actions

      function deleteWallPost(post) {
        if (post && post.id) {
          postsService.deleteWallPost(post.id)
            .then(function () {
              // on successful removal update the client side collection
              var toRemove = $scope.posts.filter(function (p) { return p.id === post.id; });
              if (toRemove.length > 0) {
                var i = $scope.posts.indexOf(toRemove[0]);
                if (i > -1) {
                  $scope.posts.splice(i, 1);
                  // TODO: replace with collection watching
                  $scope.hasNoPosts = ($scope.posts.length === 0);
                }
              }
            });
        }
      }

      function deleteNewsPost(post) {
        if (post && post.id) {
          postsService.deleteNewsPost(post.id)
            .then(function () {
              // on successful removal update the client side collection
              var toRemove = $scope.posts.filter(function (p) { return p.id === post.id; });
              if (toRemove.length > 0) {
                var i = $scope.posts.indexOf(toRemove[0]);
                if (i > -1) {
                  $scope.posts.splice(i, 1);
                  // TODO: replace with collection watching
                  $scope.hasNoPosts = ($scope.posts.length === 0);
                }
              }
            });
        }
      }

      function showLinkDialog(post) {
        var location = $location;
        var port = location.port();
        var link = location.protocol() +
          '://' + location.host() +
          ((port && port !== 80 && port !== 443) ? (':' + port) : '') +
          '/#/posts/' + post.id;

        dialogService.showDialog({
          title: 'Link to this post',
          template: '/templates/dlg-post-link.html',
          context: {
            post: post,
            link: link
          },
          submit: {
            title: 'Done'
          },
          cancel: {
            enabled: false
          }
        });
      }

      function getContextActions(post) {
        var actions = [];
        var currentUser = authService.getCurrentUser();

        if (!currentUser || !post || !post.account) {
          return actions;
        }

        var options = $scope.contextMenuOptions || {
          allowMute: true
        };

        // actions for the owner of the feed
        if (currentUser.account === post.account) {
          actions.push({ name: 'Delete post', invoke: deleteWallPost });
          actions.push({ name: 'Link to post', invoke: function () {
            showLinkDialog(post);
          }});
          actions.push({ name: '(todo) Disable comments', invoke: function () {}});
        }
        // actions for guests
        else {
          if (options.allowMute) { actions.push({ name: 'Mute post', invoke: deleteNewsPost }); }
          actions.push({ name: 'Link to post', invoke: function () {
            showLinkDialog(post);
          }});
          actions.push({ name: '(todo) Report spam or abuse', invoke: function () {}});
        }

        return actions;
      }
    }]);