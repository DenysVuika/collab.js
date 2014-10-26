angular.module('collabjs.controllers')
  .controller('PeopleController', ['$scope', 'peopleService', 'uiService',
    function ($scope, peopleService, uiService) {
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

      $scope.unfollow = function (profile) {
        if (profile) {
          uiService.confirmDialog('Do you want to unfollow this user?', function () {
            peopleService.unfollow(profile);
          });
        }
      };

      $scope.init = function () {
        peopleService.getPeople().then(function (data) {
          $scope.people = data;
          $scope.hasNoPeople = (data.length === 0);
        });
      };
    }
  ]);
