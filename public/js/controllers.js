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

  $scope.csrf = '';
  $scope.content = '';

  $scope.init = function (token) {
    $scope.csrf = token;
  };

  $scope.submit = function () {
    postsService
      .addComment({
        _csrf: $scope.csrf,
        postId: $scope.post.id,
        content: $scope.content})
      .then(function (comment) {
        var comments = $scope.post.comments || [];
        comments.push(comment);
        $scope.post.comments = comments;
        $scope.post.commentsCount++;
        $scope.content = '';
      });
  };
}

function MentionsController($scope, postsService, peopleService, profileService) {
  'use strict';

  $scope.token = '';
  $scope.user = null;
  $scope.posts = [];
  // user has no posts to display
  $scope.hasNoPosts = false;
  $scope.profilePictureUrl = profileService.profilePictureUrl();

  $scope.init = function (token) {
    $scope.token = token;
    postsService.getMentions().then(function (data) {
      console.log(data);
      $scope.user = data.user; // TODO: verify if ever provided for mentions
      if (data.feed && data.feed.length > 0) {
        $scope.posts = data.feed;
      }
      $scope.hasNoPosts = ($scope.posts.length === 0);
    });
  };

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

    var bottomPostId = null;
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
  $scope.profilePictureUrl = profileService.profilePictureUrl();

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

    var bottomPostId = null;
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

function SearchController($scope, searchService, postsService, peopleService, profileService) {
  'use strict';

  $scope.token = null;
  $scope.searchQuery = null;
  $scope.searchSource = null;
  $scope.isSaved = false;
  $scope.hasNoPosts = false;
  $scope.posts = [];$scope.profilePictureUrl = profileService.profilePictureUrl();


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