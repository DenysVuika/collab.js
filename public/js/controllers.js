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

      $scope.init = function (profile) {
        $scope.profile = profile;
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
  .controller('CommentController', ['$scope', 'postsService',
    function ($scope, postsService) {
      'use strict';

      $scope.content = '';

      /* optional, token can be provided also with the parent scope */
      $scope.init = function (token) {
        $scope.token = token;
      };

      $scope.submit = function () {
        if ($scope.token && $scope.content && $scope.content.length > 0) {
          postsService
            .addComment($scope.token, $scope.post.id, $scope.content)
            .then(function (comment) {
              var comments = $scope.post.comments || [];
              comments.push(comment);
              $scope.post.comments = comments;
              $scope.post.commentsCount++;
              $scope.content = null;
            });
        }
      };
    }
]);

angular.module('collabjs.controllers')
  .controller('MentionsController', ['$scope', 'postsService', 'profileService',
    function ($scope, postsService, profileService) {
      'use strict';

      $scope.token = '';
      $scope.posts = [];
      // user has no posts to display
      $scope.hasNoPosts = false;

      $scope.init = function (token) {
        $scope.token = token;
        postsService.getMentions().then(function (data) {
          if (data.feed && data.feed.length > 0) {
            $scope.posts = data.feed;
          }
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };

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

angular.module('collabjs.controllers')
  .controller('WallController', ['$scope', '$routeParams', 'postsService', 'profileService',
    function ($scope, $routeParams, postsService, profileService) {
      'use strict';

      $scope.token = null;
      $scope.account = $routeParams.account;
      $scope.posts = [];
      // user has no posts to display
      $scope.hasNoPosts = false;

      $scope.init = function (token) {
        $scope.token = token;

        postsService.getWall($scope.account).then(function (data) {
          $scope.profile = data.user;
          if (data.feed && data.feed.length > 0) {
            $scope.posts = data.feed;
          }
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };

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

        postsService.getWall($scope.account, bottomPostId).then(function (data) {
          $scope.posts.push.apply($scope.posts, data || []);
          $scope.isLoadingMorePosts = false;
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };
    }
]);

angular.module('collabjs.controllers')
  .controller('NewsController', ['$scope', '$compile', '$timeout', 'postsService', 'profileService',
    function ($scope, $compile, $timeout, postsService, profileService) {
      'use strict';
      $scope.token = null;
      $scope.posts = [];
      $scope.hasNoPosts = false;
      $scope.newPostsCount = 0;

      var cardLayout = true;
      $scope.templateUrl = cardLayout ? '/partials/news-cards' : '/partials/news-list';

      var layout;

      $scope.init = function (token) {
        $scope.token = token;

        postsService.getNews().then(function (data) {
          $scope.posts = data;
          $scope.hasNoPosts = (data.length === 0);
        });

        // start monitoring new updates
        $scope.checkNewPosts();
      };

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

      var _updateChecker = null;
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
    }
]);

/*
  Single card controller (used as a child of NewsController)
  Requires 'token' to be present within the current/parent scope
*/
angular.module('collabjs.controllers')
  .controller('CardController', ['$scope', '$timeout', 'postsService',
    function ($scope, $timeout, postsService) {
      'use strict';

      $scope.commentsExpanded = false;
      $scope.comment = '';

      $scope.init = function (post) {
        $scope.post = post;
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
        if ($scope.token && $scope.comment && $scope.comment.length > 0) {
          postsService
            .addComment($scope.token, $scope.post.id, $scope.comment)
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
    }]);

angular.module('collabjs.controllers')
  .controller('StatusController', ['$scope', 'postsService',
    function ($scope, postsService) {
      'use strict';

      $scope.token = null;
      $scope.content = null;

      $scope.init = function (token) {
        $scope.token = token;
      };

      $scope.submit = function () {
        if ($scope.token && $scope.content && $scope.content.length > 0) {
          postsService
            .createPost($scope.token, $scope.content)
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
  .controller('SearchController', ['$scope', '$routeParams', 'searchService', 'postsService', 'profileService',
    function ($scope, $routeParams, searchService, postsService, profileService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      $scope.token = null;
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

      $scope.init = function (token) {
        $scope.token = token;

        searchService.searchPosts($scope.query, $scope.source).then(function (data) {
          $scope.isSaved = data.isSaved;
          $scope.posts = data.entries;
          $scope.hasNoPosts = ($scope.posts.length === 0);
        });
      };

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

angular.module('collabjs.controllers')
  .controller('PostController', ['$scope', '$routeParams', 'postsService', 'profileService',
    function ($scope, $routeParams, postsService, profileService) {
      'use strict';

      $scope.postId = $routeParams.postId;
      $scope.post = null;
      $scope.hasPost = false;
      $scope.hasError = false;
      $scope.error = null;

      postsService.getPostById($scope.postId).then(function (data) {
        $scope.post = data;
        $scope.hasPost = (data !== undefined);
      }, function () {
        $scope.error = 'Post not found.';
        $scope.hasError = true;
      });

      $scope.profilePictureUrl = profileService.profilePictureUrl();
      $scope.loadPostComments = postsService.loadPostComments;
    }
]);

angular.module('collabjs.controllers')
  .controller('AccountController', ['$scope', '$timeout', 'accountService',
    function ($scope, $timeout, accountService) {
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
        $scope.token = account.token;
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
          _csrf: $scope.token, // TODO: verify whether still needed
          name: $scope.name,
          location: $scope.location,
          website: $scope.website,
          bio: $scope.bio
        };

        accountService
          .updateAccount($scope.token, account)
          .then(function () {
            $scope.info = 'Account settings have been successfully updated.';
          });
      };
    }
]);

angular.module('collabjs.controllers')
  .controller('PasswordController', ['$scope', 'accountService',
    function ($scope, accountService) {
      'use strict';

      $scope.token = null;
      $scope.pwdOld = '';
      $scope.pwdNew = '';
      $scope.pwdConfirm = '';

      $scope.error = false;
      $scope.info = false;

      $scope.init = function (token) {
        $scope.token = token;
      };

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
          .changePassword($scope.token, settings)
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
  .controller('MenuController', ['$scope', 'searchService',
    function ($scope, searchService) {
      'use strict';

      $scope.searchLists = [];

      searchService.getLists().then(
        function (data) {
          $scope.searchLists = data || [];
        }
      );

      /*
       $scope.$on('destroy', function () {
       console.log('SearchController is destroyed.');
       });
       */

      $scope.$on('listSaved@searchService', function (e, list) {
        $scope.searchLists.push(list);
      });

      $scope.$on('listDeleted@searchService', function (e, list) {
        $scope.searchLists =  $scope.searchLists.filter(function (element) {
          return element.q !== list.q;
        });
      });
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