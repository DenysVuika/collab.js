angular.module('collabjs.controllers')
  .controller('AccountController', ['$scope', '$timeout', 'accountService',
    function ($scope, $timeout, accountService) {
      'use strict';

      $scope.error = false;
      $scope.info = false;

      function formatCountry (entry) {
        if (!entry.id) { return entry.text; }
        return '<i class="flag-icon-16 flag-' + entry.id.toLowerCase() + '"></i>' + entry.text;
      }

      function initUI() {
        // TODO: turn into directive?
        $('#bio').countdown({
          limit: 160,
          init: function (counter) {
            $('#bio_counter').css('color', '#999').text(counter);
          },
          plus: function (counter) {
            $('#bio_counter').css('color', '#999').text(counter);
            $('#submit').removeAttr('disabled');
          },
          minus: function (counter) {
            $('#bio_counter').css('color', 'red').text(counter);
            $('#submit').attr('disabled', 'disabled');
          }
        });
      }

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
        formatResult: formatCountry,
        formatSelection: formatCountry
      };

      accountService.getAccount().then(function (account) {
        $scope.token = account.token;
        $scope.avatarServer = account.avatarServer;
        $scope.pictureUrl = account.pictureUrl;
        $scope.name = account.name;
        $scope.location = account.location;
        $scope.website = account.website;
        $scope.bio = account.bio;

        $timeout(initUI);
      });

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      $scope.submit = function () {
        var account = {
          _csrf: $scope.token, // TODO: verify whether still needed
          name: $scope.name,
          location: $scope.location,
          website: $scope.website,
          bio: $scope.bio
        };

        accountService
          .updateAccount($scope.token, account)
          .then(function () {
            $scope.info = 'Account settings have been successfully updated.';
          });
      };
    }
  ]);