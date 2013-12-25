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
