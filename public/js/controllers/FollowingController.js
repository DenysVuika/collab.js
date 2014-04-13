angular.module('collabjs.controllers')
  .controller('FollowingController', ['$scope', '$routeParams', 'peopleService',
    function ($scope, $routeParams, peopleService) {
      'use strict';

      $scope.people = [];
      // server returns no people for current user
      $scope.hasNoPeople = false;

      $scope.canFollow = peopleService.canFollow;
      $scope.canUnfollow = peopleService.canUnfollow;
      $scope.getCountryName = peopleService.getCountryName;
      $scope.getFollowingUrl = peopleService.getFollowingUrl;
      $scope.getFollowersUrl = peopleService.getFollowersUrl;
      $scope.follow = peopleService.follow;
      $scope.unfollow = peopleService.unfollow;

      $scope.init = function () {
        peopleService.getFollowing($routeParams.account).then(function (data) {
          $scope.profile = data.user;
          $scope.people = data.feed || [];
          $scope.hasNoPeople = ($scope.people.length === 0);
        });
      };
    }
  ]);
