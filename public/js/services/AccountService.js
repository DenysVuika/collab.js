angular.module('collabjs.services')
  .service('accountService', ['$http', '$q',
    function ($http, $q) {
      'use strict';
      return {
        getAccount: function () {
          var d = $q.defer();
          $http.get('/api/account').success(function (data) { d.resolve(data); });
          return d.promise;
        },
        updateAccount: function (token, data) {
          var d = $q.defer()
            , options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
          $http.post('/api/account', data, options).success(function () { d.resolve(true); });
          return d.promise;
        },
        changePassword: function (token, data) {
          var d = $q.defer()
            , options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
          $http.post('/api/account/password', data, options)
            .success(function (res) { console.log(res); d.resolve(res); })
            .error(function (data) { d.reject(data); });
          return d.promise;
        }
      };
    }]);