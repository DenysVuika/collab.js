/*
 Single card controller (used as a child of NewsController)
 */
angular.module('collabjs.controllers')
  .controller('CardController', ['$rootScope', '$scope', '$timeout', '$location', 'authService', 'postsService', 'dialogService',
    function ($rootScope, $scope, $timeout, $location, authService, postsService, dialogService) {
      'use strict';

      var disableCommentsAction;
      var enableCommentsAction;

      $scope.commentsExpanded = false;
      $scope.comment = '';
      $scope.contextActions = [];

      function requestLayoutUpdate() {
        // TODO: extract into a separate UI service
        $rootScope.$broadcast('updateLayout@collab.js');
      }

      $scope.init = function (post) {
        $scope.post = post;
        $scope.contextActions = setupContextActions(post);
      };

      $scope.toggleComments = function () {
        if ($scope.commentsExpanded) {
          $scope.commentsExpanded = false;
          requestLayoutUpdate();
        } else {
          postsService.loadPostComments($scope.post, function () {
            $scope.commentsExpanded = true;
            requestLayoutUpdate();
          });
        }
      };

      $scope.postComment = function () {
        if ($scope.comment && $scope.comment.length > 0) {
          postsService
            .addComment($scope.post.id, $scope.comment)
            .then(function (comment) {
              var comments = $scope.post.comments || [];
              comments.push(comment);
              $scope.post.comments = comments;
              $scope.post.commentsCount++;
              $scope.comment = null;
              if ($scope.commentsExpanded) {
                requestLayoutUpdate();
              }
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

      $scope.$watch("post.readonly", function (newValue) {
        var readonly = newValue ? true : false;
        if (disableCommentsAction) {
          disableCommentsAction.visible = !readonly;
        }
        if (enableCommentsAction) {
          enableCommentsAction.visible = readonly;
        }
      });

      function disableComments(post) {
        postsService.lockPost(post.id).then(function () {
          post.readonly = true;
          $rootScope.$broadcast('updateLayout@collab.js');
        });
      }

      function enableComments(post) {
        postsService.unlockPost(post.id).then(function () {
          post.readonly = false;
          requestLayoutUpdate();
        });
      }

      function setupContextActions(post) {
        var actions = [];
        var currentUser = authService.getCurrentUser();

        if (!currentUser || !post || !post.account) {
          return actions;
        }

        var options = $scope.contextMenuOptions || {
          allowMute: true
        };

        var readonly = post.readonly ? true : false;
        var linkToPostAction = { name: 'Link to post', visible: true, invoke: showLinkDialog };
        disableCommentsAction = { name: 'Disable comments', visible: !readonly, invoke: disableComments };
        enableCommentsAction = { name: 'Enable comments', visible: readonly, invoke: enableComments };

        // actions for the owner of the feed
        if (currentUser.account === post.account) {
          actions.push({ name: 'Delete post', visible: true, invoke: deleteWallPost });
          actions.push(linkToPostAction);
          actions.push(disableCommentsAction);
          actions.push(enableCommentsAction);
        }
        // actions for guests
        else {
          if (options.allowMute) { actions.push({ name: 'Mute post', visible: true, invoke: deleteNewsPost }); }
          actions.push(linkToPostAction);
          actions.push({ name: '(todo) Report spam or abuse', visible: true, invoke: function () {}});
        }

        return actions;
      }
    }]);