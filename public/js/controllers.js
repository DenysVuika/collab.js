function UserProfileController($scope, peopleService) {
  'use strict';

  //$scope.profile = null;
  $scope.getCountryName = peopleService.getCountryName;
  $scope.canFollow = peopleService.canFollow;
  $scope.follow = peopleService.follow;
  $scope.canUnfollow = peopleService.canUnfollow;
  $scope.unfollow = peopleService.unfollow;
  $scope.getProfileFeed = peopleService.getProfileFeed;
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

  $scope.init = function () {
    peopleService.getPeople().then(function (data) {
      $scope.people = data;
      $scope.hasNoPeople = ($scope.people.length === 0);
    });
  };

  $scope.initFollowing = function (account) {
    peopleService.getFollowing(account).then(function (data) {
      $scope.profile = data.user;
      $scope.people = data.feed || [];
      $scope.hasNoPeople = ($scope.people.length === 0);
    });
  };

  $scope.initFollowers = function (account) {
    peopleService.getFollowers(account).then(function (data) {
      $scope.profile = data.user;
      $scope.people = data.feed || [];
      $scope.hasNoPeople = ($scope.people.length === 0);
    });
  };

  $scope.canFollow = peopleService.canFollow;
  $scope.canUnfollow = peopleService.canUnfollow;
  $scope.getCountryName = peopleService.getCountryName;
  $scope.getProfileFeed = peopleService.getProfileFeed;
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

function MentionsController($scope, postsService, peopleService, profileService) {
  'use strict';

  $scope.token = '';
  $scope.user = null;
  $scope.posts = [];
  // user has no posts to display
  $scope.hasNoPosts = false;


  $scope.init = function (token) {
    $scope.token = token;
    postsService.getMentions().then(function (data) {
      $scope.user = data.user; // TODO: verify if ever provided for mentions
      if (data.feed && data.feed.length > 0) {
        $scope.posts = data.feed;
      }
      $scope.hasNoPosts = ($scope.posts.length === 0);
    });
  };

  $scope.profilePictureUrl = profileService.profilePictureUrl();
  $scope.getProfileFeed = peopleService.getProfileFeed;
  $scope.getPostUrl = postsService.getPostUrl;
  $scope.getPostContent = postsService.getPostContent;
  $scope.loadPostComments = postsService.loadPostComments;

  $scope.deletePost = function (post) {
    if (post) {
      postsService.deletePost(post.id, $scope.token).then(function () {
        var i = $scope.posts.indexOf(post);
        if (i >-1) {
          $scope.posts.splice(i, 1);
          $scope.hasNoPosts = ($scope.posts.length === 0);
        }
        // Raise event to notify external components
        // TODO: remove
        $(document).trigger("collabjs.onPostRemoved", post);
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

function WallController($scope, postsService, peopleService, profileService) {
  'use strict';

  $scope.token = null;
  $scope.account = null;
  $scope.user = null;
  $scope.posts = [];
  // user has no posts to display
  $scope.hasNoPosts = false;

  $scope.init = function (token, account) {
    $scope.account = account;
    $scope.token = token;

    postsService.getWall(account).then(function (data) {
      $scope.profile = data.user;
      if (data.feed && data.feed.length > 0) {
        $scope.posts = data.feed;
      }
      $scope.hasNoPosts = ($scope.posts.length === 0);
    });
  };

  $scope.profilePictureUrl = profileService.profilePictureUrl();
  $scope.getProfileFeed = peopleService.getProfileFeed;
  $scope.getPostUrl = postsService.getPostUrl;
  $scope.getPostContent = postsService.getPostContent;
  $scope.loadPostComments = postsService.loadPostComments;

  $scope.deletePost = function (post) {
    if (post) {
      postsService.deletePost(post.id, $scope.token).then(function () {
        var i = $scope.posts.indexOf(post);
        if (i >-1) {
          $scope.posts.splice(i, 1);
          $scope.hasNoPosts = ($scope.posts.length === 0);
        }
        // Raise event to notify external components
        $(document).trigger("collabjs.onPostRemoved", post);
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

function NewsController($scope, $timeout, postsService, peopleService, profileService) {
  'use strict';
  $scope.token = null;
  $scope.account = null;
  $scope.posts = [];
  $scope.hasNoPosts = false;
  $scope.newPostsCount = 0;
  // TODO: check whether $scope is needed here
  var _updateChecker = null;

  $scope.init = function (token, account) {
    $scope.account = account;
    $scope.token = token;

    postsService.getNews().then(function (data) {
      $scope.posts = data;
      $scope.hasNoPosts = (data.length === 0);
    });

    // start monitoring new updates
    $scope.checkNewPosts();
  };

  $scope.profilePictureUrl = profileService.profilePictureUrl();
  $scope.getProfileFeed = peopleService.getProfileFeed;
  $scope.getPostUrl = postsService.getPostUrl;
  $scope.getPostContent = postsService.getPostContent;
  $scope.loadPostComments = postsService.loadPostComments;

  $scope.deletePost = function (post) {
    if (post) {
      postsService.deletePost(post.id, $scope.token).then(function () {
        var i = $scope.posts.indexOf(post);
        if (i >-1) {
          $scope.posts.splice(i, 1);
          $scope.hasNoPosts = ($scope.posts.length === 0);
        }
        // Raise event to notify external components
        $(document).trigger("collabjs.onPostRemoved", post);
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

function SearchController($scope, searchService, postsService, peopleService, profileService) {
  'use strict';

  $scope.token = null;
  $scope.searchQuery = null;
  $scope.searchSource = null;
  $scope.isSaved = false;
  $scope.hasNoPosts = false;
  $scope.posts = [];

  $scope.init = function (token, q, src, saved) {
    $scope.token = token;
    $scope.searchQuery = q;
    $scope.searchSource = src;
    $scope.isSaved = saved;

    searchService.searchPosts(q, src).then(function (data) {
      $scope.posts = data;
      $scope.hasNoPosts = ($scope.posts.length === 0);
    });
  };

  $scope.profilePictureUrl = profileService.profilePictureUrl();
  $scope.getProfileFeed = peopleService.getProfileFeed;
  $scope.getPostUrl = postsService.getPostUrl;
  $scope.getPostContent = postsService.getPostContent;
  $scope.loadPostComments = postsService.loadPostComments;

  $scope.saveList = function () {
    searchService
      .saveList($scope.token, $scope.searchQuery, $scope.searchSource)
      .then(function () {
        $scope.isSaved = true;
      });
  };

  $scope.deleteList = function () {
    searchService
      .deleteList($scope.token, $scope.searchQuery, $scope.searchSource)
      .then(function () {
        $scope.isSaved = false;
      });
  };

  $scope.deletePost = function (post) {
    if (post) {
      postsService.deletePost(post.id, $scope.token).then(function () {
        var i = $scope.posts.indexOf(post);
        if (i >-1) {
          $scope.posts.splice(i, 1);
          $scope.hasNoPosts = ($scope.posts.length === 0);
        }
        // Raise event to notify external components
        $(document).trigger("collabjs.onPostRemoved", post);
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

function PostController($scope, postsService, peopleService, profileService) {
  'use strict';

  $scope.postId = null;
  $scope.post = null;
  $scope.hasPost = false;
  $scope.hasError = false;
  $scope.error = null;

  $scope.init = function (postId) {
    $scope.postId = postId;

    postsService.getPostById(postId).then(function (data) {
      $scope.post = data;
      $scope.hasPost = (data !== null);
    }, function (err) {
      $scope.error = 'Post not found.';
      $scope.hasError = true;
    });
  };

  $scope.profilePictureUrl = profileService.profilePictureUrl();
  $scope.getProfileFeed = peopleService.getProfileFeed;
  $scope.getPostUrl = postsService.getPostUrl;
  $scope.getPostContent = postsService.getPostContent;
  $scope.loadPostComments = postsService.loadPostComments;
}
