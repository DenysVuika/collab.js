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
          $http.get('/api/account').success(function (data) { d.resolve(data); });
          return d.promise;
        },
        updateAccount: function (data) {
          var d = $q.defer();
          $http.post('/api/account', data)
            .success(function () { d.resolve(true); });
          return d.promise;
        },
        changePassword: function (data) {
          var d = $q.defer();
          $http.post('/api/account/password', data)
            .success(function (res) { d.resolve(res); })
            .error(function (data) { d.reject(data); });
          return d.promise;
        }
      };
    }]);