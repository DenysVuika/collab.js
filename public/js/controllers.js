function PeopleListController($scope, peopleService) {
  'use strict';

  $scope.people = [];
  // server returns no people for current user
  $scope.hasNoPeople = false;

  $scope.init = function () {
    peopleService.getPeople().then(function (data) {
      $scope.people = data;
      if (!data || data.length === 0) {
        $scope.hasNoPeople = true;
      }
    });
  };

  $scope.initFollowing = function (account) {
    peopleService.getFollowing(account).then(function (data) {
      $scope.profile = data.user;
      if (data.feed && data.feed.length > 0) {
        $scope.people = data.feed;
      } else {
        $scope.hasNoPeople = true;
      }
    });
  };

  $scope.initFollowers = function (account) {
    peopleService.getFollowers(account).then(function (data) {
      $scope.profile = data.user;
      if (data.feed && data.feed.length > 0) {
        $scope.people = data.feed;
      } else {
        $scope.hasNoPeople = true;
      }
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
      } else {
        $scope.hasNoPosts = true;
      }
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
        }
        // Raise event to notify external components
        $(document).trigger("collabjs.onPostRemoved", post);
      });
    }
  };

  $scope.isLoadingMorePosts = false;

  $scope.loadMorePosts = function () {
    if ($scope.isLoadingMorePosts || $scope.posts.length === 0) { return; }
    $scope.isLoadingMorePosts = true;

    var bottomPostId = Math.min.apply(this, $.map($scope.posts, function (p) {
      return p.id;
    }));

    postsService.getMentions(bottomPostId).then(function (data) {
      $scope.posts.push.apply($scope.posts, data || []);
      $scope.isLoadingMorePosts = false;
    });
  };
}

function CommentController($scope, $http, postsService) {
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