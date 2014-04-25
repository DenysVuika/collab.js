angular.module('collabjs.controllers')
  .controller('AccountController', ['$scope', '$timeout', '$http', 'accountService',
    function ($scope, $timeout, $http, accountService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      $scope.countries = collabjs.countryData;
      $scope.select2Options = {
        placeholder: 'Select a Country',
        allowClear: true,
        formatResult: collabjs.formatCountry,
        formatSelection: collabjs.formatCountry
      };

      $scope.init = function() {
        accountService.getAccount().then(function (account) {
          // TODO: verify whether needed
          if (account.token) {
            $http.defaults.headers.common['x-csrf-token'] = account.token;
          }

          $scope.avatarServer = account.avatarServer;
          $scope.pictureUrl = account.pictureUrl;
          $scope.name = account.name;
          $scope.location = account.location;
          $scope.website = account.website;
          $scope.bio = account.bio;
        });
      };

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };
      $scope.updateSuccessMsg = 'Account settings have been successfully updated.';

      $scope.submit = function () {
        var account = {
          name: $scope.name,
          location: $scope.location,
          website: $scope.website,
          bio: $scope.bio
        };

        // TODO: wire and display error message
        accountService
          .updateAccount(account)
          .then(function () {
            $scope.info = $scope.updateSuccessMsg;
          });
      };
    }
  ]);