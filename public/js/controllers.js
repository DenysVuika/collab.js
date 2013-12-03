function UserProfileController($scope, peopleService) {
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

function PeopleListController($scope, peopleService) {
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

function FollowingController($scope, $routeParams, peopleService) {
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

function FollowersController($scope, $routeParams, peopleService) {
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

function CommentController($scope, postsService) {
  'use strict';

  $scope.token = '';
  $scope.content = '';

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

function MentionsController($scope, postsService, profileService) {
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

function WallController($scope, $routeParams, postsService, profileService) {
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

function NewsController($scope, $timeout, postsService, profileService) {
  'use strict';
  $scope.token = null;
  $scope.posts = [];
  $scope.hasNoPosts = false;
  $scope.newPostsCount = 0;

  $scope.init = function (token) {
    $scope.token = token;

    postsService.getNews().then(function (data) {
      $scope.posts = data;
      $scope.hasNoPosts = (data.length === 0);
    });

    // start monitoring new updates
    $scope.checkNewPosts();
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

function StatusController($scope, postsService) {
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

function SearchController($scope, $routeParams, searchService, postsService, profileService) {
  'use strict';

  $scope.error = false;
  $scope.info = false;

  $scope.token = null;
  $scope.query = $routeParams.q || null;
  $scope.source = $routeParams.src || 'unknown';
  $scope.isSaved = false;
  $scope.hasNoPosts = false;
  $scope.posts = [];

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

function PostController($scope, $routeParams, postsService, profileService) {
  'use strict';

  $scope.postId = $routeParams.postId;
  $scope.post = null;
  $scope.hasPost = false;
  $scope.hasError = false;
  $scope.error = null;

  postsService.getPostById($scope.postId).then(function (data) {
    $scope.post = data;
    $scope.hasPost = (data !== undefined);
  }, function (err) {
    $scope.error = 'Post not found.';
    $scope.hasError = true;
  });

  $scope.profilePictureUrl = profileService.profilePictureUrl();
  $scope.loadPostComments = postsService.loadPostComments;
}

function AccountController($scope, $timeout, accountService) {
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

function PasswordController($scope, accountService) {
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
        function (data) {
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

function SidebarController($scope, $location) {
  'use strict';
}