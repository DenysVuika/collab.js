angular.module('collabjs.controllers')
  .controller('PeopleController', ['$scope', 'peopleService',
    function ($scope, peopleService) {
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
        peopleService.getPeople().then(function (data) {
          $scope.people = data;
          $scope.hasNoPeople = (data.length === 0);
        });
      };
    }
  ]);
