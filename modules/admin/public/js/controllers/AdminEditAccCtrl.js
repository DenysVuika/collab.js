angular.module('collabjs.controllers')
  .controller('AdminEditAccCtrl', ['$scope', '$routeParams', '$location', 'adminService',
    function ($scope, $routeParams, $location, adminService) {
      'use strict';

      $scope.error = false;
      $scope.id = '';
      $scope.account = '';
      $scope.name = '';
      $scope.location = '';
      $scope.website = '';
      $scope.bio = '';

      $scope.countries = collabjs.countryData;
      $scope.select2Options = {
        placeholder: 'Select a Country',
        allowClear: true,
        formatResult: collabjs.formatCountry,
        formatSelection: collabjs.formatCountry
      };

      $scope.init = function () {
        if ($routeParams.account) {
          adminService
            .getAccount($routeParams.account)
            .then(
              function (result) {
                if (result) {
                  console.log(result);
                  $scope.id = result.id;
                  $scope.account = result.account;
                  $scope.name = result.name;
                  $scope.location = result.location;
                  $scope.website = result.website;
                  $scope.bio = result.bio;
                }
              },
              function (err) {
                $scope.error = err;
              }
            );
        }
      };

      $scope.update = function () {
        // TODO: validate current settings
        var data = {
          id: $scope.id,
          name: $scope.name,
          location: $scope.location,
          website: $scope.website,
          bio: $scope.bio
        };

        adminService
          .updateAccount($scope.name, data)
          .then(
            function () { $location.path('/admin/accounts').replace(); },
            function (err) { $scope.error = err; }
          );
      };
    }]);