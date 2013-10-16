function PeopleListController($scope, peopleService) {
  'use strict';

  $scope.test = 'Hello world';
  $scope.people = [];
  // server returns no people for current user
  $scope.hasNoPeople = false;

  $scope.init = function () {
    peopleService.getPeople().then(function (data) {
      $scope.people = data;
      if (!data || data.length === 0) {
        $scope.hasNoPeople = true;
      }
      //console.log(data);
    });
  };

  $scope.initFollowing = function (account) {
    peopleService.getFollowing(account).then(function (data) {
      //console.log(data);
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
      //console.log(data);
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