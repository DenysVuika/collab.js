angular.module('collabjs.services')
  .service('accountService', ['$http', '$q',
    function ($http, $q) {
      'use strict';
      return {
        createAccount: function (account, name, email, password) {
          var d = $q.defer()
            , data = { account: account, name: name, email: email, password: password };
          $http.post('/api/account/register', data)
            .success(function (res) { d.resolve(res); })
            .error(function (res) { d.reject(res); });
          return d.promise;
        },
        getAccount: function () {
          var d = $q.defer();
          $http.get('/api/profile')
            .success(function (data) { d.resolve(data); });
          return d.promise;
        },
        updateAccount: function (data) {
          var d = $q.defer();
          $http.post('/api/profile', data)
            .success(function () { d.resolve(true); });
          return d.promise;
        },
        changePassword: function (data) {
          var d = $q.defer();
          $http.post('/api/profile/password', data)
            .success(function (res) { d.resolve(res); })
            .error(function (data) { d.reject(data); });
          return d.promise;
        }
      };
    }]);