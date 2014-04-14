angular.module('collabjs.controllers')
  .controller('AccountController', ['$scope', '$timeout', '$http', 'accountService',
    function ($scope, $timeout, $http, accountService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      $scope.formatCountry = function(entry) {
        if (!entry) { return ''; }
        if (!entry.id) { return entry.text || ''; }
        return '<i class="flag-icon-16 flag-' + entry.id.toLowerCase() + '"></i>' + entry.text;
      };

      var countryData = [];
      for (var key in collabjs.countries) {
        if (collabjs.countries.hasOwnProperty(key)) {
          countryData.push({ id: key, text: collabjs.countries[key] });
        }
      }

      $scope.countries = countryData;
      $scope.select2Options = {
        placeholder: 'Select a Country',
        allowClear: true,
        formatResult: $scope.formatCountry,
        formatSelection: $scope.formatCountry
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