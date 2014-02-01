/*!
* collab.js v0.5.0-alpha
* Copyright (c) 2013-2014 Denis Vuyka
* License: MIT
* http://www.opensource.org/licenses/mit-license.php
*/
angular.module('collabjs.controllers')
  .controller('AccountController', ['$scope', '$timeout', '$http', 'accountService',
    function ($scope, $timeout, $http, accountService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      function formatCountry (entry) {
        if (!entry.id) { return entry.text; }
        return '<i class="flag-icon-16 flag-' + entry.id.toLowerCase() + '"></i>' + entry.text;
      }

      function initUI() {
        // TODO: turn into directive?
        $('#bio').countdown({
          limit: 160,
          init: function (counter) {
            $('#bio_counter').css('color', '#999').text(counter);
          },
          plus: function (counter) {
            $('#bio_counter').css('color', '#999').text(counter);
            $('#submit').removeAttr('disabled');
          },
          minus: function (counter) {
            $('#bio_counter').css('color', 'red').text(counter);
            $('#submit').attr('disabled', 'disabled');
          }
        });
      }

      var countryData = [];
      for (var key in collabjs.countries) {
        if (collabjs.countries.hasOwnProperty(key)) {
          countryData.push({ id: key, text: collabjs.countries[key] });
        }
      }

      $scope.countries = countryData;
      $scope.select2Options = {
        placeholder: 'Select a Country',
        allowClear: true,
        formatResult: formatCountry,
        formatSelection: formatCountry
      };

      accountService.getAccount().then(function (account) {
        // TODO: verify whether needed
        $http.defaults.headers.common['x-csrf-token'] = account.token;
        $scope.avatarServer = account.avatarServer;
        $scope.pictureUrl = account.pictureUrl;
        $scope.name = account.name;
        $scope.location = account.location;
        $scope.website = account.website;
        $scope.bio = account.bio;

        $timeout(initUI);
      });

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      $scope.submit = function () {
        var account = {
          name: $scope.name,
          location: $scope.location,
          website: $scope.website,
          bio: $scope.bio
        };

        accountService
          .updateAccount(account)
          .then(function () {
            $scope.info = 'Account settings have been successfully updated.';
          });
      };
    }
  ]);
/*
root application controller
 scope variables declared here may be accessible to all child controllers
*/
angular.module('collabjs.controllers')
  .controller('AppController', ['$scope', '$http',
    function ($scope, $http) {
      'use strict';

      $scope.appName = 'collab.js';
      $scope.appConfig = collabjs.config;

      $scope.init = function (token) {
        // set default csrf token for all requests
        $http.defaults.headers.common['x-csrf-token'] = token;
      };
    }]);
/*
 Single card controller (used as a child of NewsController)
 */
angular.module('collabjs.controllers')
  .controller('CardController', ['$scope', '$timeout', 'authService', 'postsService',
    function ($scope, $timeout, authService, postsService) {
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
          actions.push({ name: '(todo) Link to post', invoke: function () {}});
          actions.push({ name: '(todo) Disable comments', invoke: function () {}});
        }
        // actions for guests
        else {
          if (options.allowMute) { actions.push({ name: 'Mute post', invoke: deleteNewsPost }); }
          actions.push({ name: '(todo) Link to post', invoke: function () {}});
          actions.push({ name: '(todo) Report spam or abuse', invoke: function () {}});
        }

        return actions;
      }
    }]);
angular.module('collabjs.controllers')
  .controller('FollowersController', ['$scope', '$routeParams', 'peopleService',
    function ($scope, $routeParams, peopleService) {
      'use strict';

      $scope.people = [];
      // server returns no people for current user
      $scope.hasNoPeople = false;

      peopleService.getFollowers($routeParams.account).then(function (data) {
        $scope.profile = data.user;
        $scope.people = data.feed || [];
        $scope.hasNoPeople = ($scope.people.length === 0);
      });

      $scope.canFollow = peopleService.canFollow;
      $scope.canUnfollow = peopleService.canUnfollow;
      $scope.getCountryName = peopleService.getCountryName;
      $scope.getFollowingUrl = peopleService.getFollowingUrl;
      $scope.getFollowersUrl = peopleService.getFollowersUrl;
      $scope.follow = peopleService.follow;
      $scope.unfollow = peopleService.unfollow;
    }
  ]);
angular.module('collabjs.controllers')
  .controller('FollowingController', ['$scope', '$routeParams', 'peopleService',
    function ($scope, $routeParams, peopleService) {
      'use strict';

      $scope.people = [];
      // server returns no people for current user
      $scope.hasNoPeople = false;

      peopleService.getFollowing($routeParams.account).then(function (data) {
        $scope.profile = data.user;
        $scope.people = data.feed || [];
        $scope.hasNoPeople = ($scope.people.length === 0);
      });

      $scope.canFollow = peopleService.canFollow;
      $scope.canUnfollow = peopleService.canUnfollow;
      $scope.getCountryName = peopleService.getCountryName;
      $scope.getFollowingUrl = peopleService.getFollowingUrl;
      $scope.getFollowersUrl = peopleService.getFollowersUrl;
      $scope.follow = peopleService.follow;
      $scope.unfollow = peopleService.unfollow;
    }
  ]);

angular.module('collabjs.controllers')
  .controller('HelpController', ['$scope', '$routeParams', 'helpService', '$sce',
    function ($scope, $routeParams, helpService, $sce) {
      'use strict';

      $scope.content = null;

      helpService.getArticle($routeParams.article).then(function (data) {
        //$scope.content = $sce.trustAsHtml(data);
        $scope.content = data;
      });
    }
  ]);
angular.module('collabjs.controllers')
  .controller('LoginController', ['$scope', '$location', 'authService',
    function ($scope, $location, authService) {
      'use strict';

      $scope.error = false;
      $scope.username = '';
      $scope.password = '';

      function reset() {
        $scope.username = '';
        $scope.password = '';
      }

      $scope.login = function () {
        authService
          .login($scope.username, $scope.password)
          .then(
            function () {
              reset();
              $location.url('/news');
            },
            function () {
              reset();
              $scope.error = 'Incorrect username or password';
            }
          );
      };

      $scope.logout = function () {
        authService.logout().then(function () { $location.url('/login'); });
      };
    }
  ]);
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
angular.module('collabjs.controllers')
  .controller('MenuController', ['$scope', 'authService', 'menuService', 'searchService',
    function ($scope, authService, menuService, searchService) {
      'use strict';

      $scope.visible = false;
      $scope.searchLists = [];
      $scope.isAuthenticated = false;
      $scope.items = [];

      $scope.$on('$routeChangeSuccess', function () {
        var user = authService.getCurrentUser();
        if (user) {
          $scope.isAuthenticated = true;
          $scope.userName = user.name;
          $scope.userPictureUrl = user.pictureUrl;
          $scope.userAccount = user.account;

          // TODO: optimize (called on every route change)
          searchService.getLists().then(
            function (data) {
              $scope.searchLists = data || [];
            }
          );

          // load menu items
          menuService.getMenuItems().then(function (items) {
            $scope.items = items || [];
          });

        } else {
          $scope.isAuthenticated = false;
          $scope.userName = null;
        }
      });


      $scope.$on('listSaved@searchService', function (e, list) {
        $scope.searchLists.push(list);
      });

      $scope.$on('listDeleted@searchService', function (e, list) {
        $scope.searchLists =  $scope.searchLists.filter(function (element) {
          return element.q !== list.q;
        });
      });

      /*
       $scope.$on('destroy', function () {
       console.log('SearchController is destroyed.');
       });
       */
    }
  ]);
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
angular.module('collabjs.controllers')
  .controller('PasswordController', ['$scope', 'accountService',
    function ($scope, accountService) {
      'use strict';

      $scope.pwdOld = '';
      $scope.pwdNew = '';
      $scope.pwdConfirm = '';

      $scope.error = false;
      $scope.info = false;

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      function clear() {
        $scope.pwdOld = '';
        $scope.pwdNew = '';
        $scope.pwdConfirm = '';
      }

      $scope.submit = function () {
        var settings = {
          pwdOld: $scope.pwdOld,
          pwdNew: $scope.pwdNew,
          pwdConfirm: $scope.pwdConfirm
        };

        accountService
          .changePassword(settings)
          .then(
          function () {
            $scope.info = 'Password has been successfully changed.';
            clear();
          },
          function (err) {
            $scope.error = 'Error: ' + err;
            clear();
          }
        );
      };
    }
  ]);
angular.module('collabjs.controllers')
  .controller('PeopleListController', ['$scope', 'peopleService',
    function ($scope, peopleService) {
      'use strict';

      $scope.people = [];
      // server returns no people for current user
      $scope.hasNoPeople = false;

      peopleService.getPeople().then(function (data) {
        $scope.people = data;
        $scope.hasNoPeople = ($scope.people.length === 0);
      });

      $scope.canFollow = peopleService.canFollow;
      $scope.canUnfollow = peopleService.canUnfollow;
      $scope.getCountryName = peopleService.getCountryName;
      $scope.getFollowingUrl = peopleService.getFollowingUrl;
      $scope.getFollowersUrl = peopleService.getFollowersUrl;
      $scope.follow = peopleService.follow;
      $scope.unfollow = peopleService.unfollow;
    }
  ]);

angular.module('collabjs.controllers')
  .controller('PostController', ['$scope', '$routeParams', 'postsService',
    function ($scope, $routeParams, postsService) {
      'use strict';

      $scope.postId = $routeParams.postId;
      $scope.posts = [];
      $scope.hasPost = false;
      $scope.hasError = false;
      $scope.error = null;

      postsService.getPostById($scope.postId).then(function (data) {
        $scope.posts = [data];
        $scope.hasPost = ($scope.posts.length > 0);
      }, function () {
        $scope.error = 'Post not found.';
        $scope.hasError = true;
      });

      // do nothing here
      $scope.loadMorePosts = function () {};
    }
  ]);
angular.module('collabjs.controllers')
  .controller('RegistrationController', ['$scope', '$location', 'accountService',
    function ($scope, $location, accountService) {
      'use strict';

      $scope.error = false;
      $scope.account = '';
      $scope.name = '';
      $scope.email = '';
      $scope.password = '';
      $scope.confirmPassword = '';

      $scope.register = function () {
        accountService
          .createAccount($scope.name, $scope.email, $scope.password)
          .then(
            function () { $location.path('/').replace(); },
            function (err) {
              $scope.error = err;
              $scope.password = '';
              $scope.confirmPassword = '';
            }
          );
      };
    }]);
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
angular.module('collabjs.controllers')
  .controller('StatusController', ['$scope', 'postsService',
    function ($scope, postsService) {
      'use strict';
      $scope.content = null;

      $scope.submit = function () {
        if ($scope.content && $scope.content.length > 0) {
          postsService
            .createPost($scope.content)
            .then(function (post) {
              $scope.content = null;
              // access and modify parent scope items
              $scope.posts.push(post);
            });
        }
      };
    }
  ]);
angular.module('collabjs.controllers')
  .controller('UserProfileController', ['$scope', 'peopleService',
    function ($scope, peopleService) {
      'use strict';

      $scope.getCountryName = peopleService.getCountryName;
      $scope.canFollow = peopleService.canFollow;
      $scope.follow = peopleService.follow;
      $scope.canUnfollow = peopleService.canUnfollow;
      $scope.unfollow = peopleService.unfollow;
      $scope.getFollowingUrl = peopleService.getFollowingUrl;
      $scope.getFollowersUrl = peopleService.getFollowersUrl;

      /*$scope.init = function (profile) {
        $scope.profile = profile;
      };*/
    }
  ]);
angular.module('collabjs.controllers')
  .controller('WallController', ['$scope', '$routeParams', 'postsService',
    function ($scope, $routeParams, postsService) {
      'use strict';

      $scope.error = false;
      $scope.account = $routeParams.account;
      $scope.posts = [];
      $scope.hasNoPosts = false;
      $scope.isLoadingMorePosts = false;

      // allows switching on/off various context menu actions
      $scope.contextMenuOptions = {
        allowMute: false  // switches off 'Mute' action for Wall guests
      };

      postsService.getWall($scope.account).then(
        function (data) {
          $scope.profile = data.user;
          if (data.feed && data.feed.length > 0) {
            $scope.posts = data.feed;
            $scope.hasNoPosts = ($scope.posts.length === 0);
          }
          $scope.hasNoPosts = ($scope.posts.length === 0);
        },
        function () {
          $scope.error = 'THE RESOURCE YOU ARE LOOKING FOR HAS BEEN REMOVED, HAD ITS NAME CHANGED, OR IS TEMPORARILY UNAVAILABLE.';
        });

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
          $scope.posts.push.apply($scope.posts, data || []);
          $scope.isLoadingMorePosts = false;
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };
    }
  ]);