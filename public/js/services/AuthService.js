angular.module('collabjs.services')
  .service('authService', ['$http', '$q',
    function ($http, $q) {
      'use strict';

      var _user = null;

      return {
        setCurrentUser: function (u) {
          _user = u;
        },
        getCurrentUser: function () {
          return _user;
        },
        login: function (username, password) {
          var deferred = $q.defer();

          $http.post('/api/auth/login', { username: username, password: password })
            .success(function (res) {
              _user = res;
              deferred.resolve(_user);
            })
            .error(function (data, status) {
              _user = false;
              deferred.reject(null);
            });

          return deferred.promise;
        },
        logout: function () {
          var deferred = $q.defer();

          $http.post('/api/auth/logout', null)
            .success(function () {
              _user = null;
              deferred.resolve(true);
            })
            .error(function (data, status) {
              // status === 401 (Unauthorized)
              deferred.reject(null);
            });

          return deferred.promise;
        }
      };
    }]);