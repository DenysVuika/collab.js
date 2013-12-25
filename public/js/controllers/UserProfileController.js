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