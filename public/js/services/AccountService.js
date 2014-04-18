angular.module('collabjs.services')
  .service('accountService', ['$http', '$q',
    function ($http, $q) {
      'use strict';
      return {
        /**
         * Create new account.
         * @param {string} account Account name.
         * @param {string} name User name.
         * @param {string} email Email address.
         * @param {string} password Account password.
         * @returns {promise}
         */
        createAccount: function (account, name, email, password) {
          var d = $q.defer()
            , data = { account: account, name: name, email: email, password: password };
          $http.post('/api/account/register', data)
            .success(function (res) { d.resolve(res); })
            .error(function (err) { d.reject(err); });
          return d.promise;
        },
        /**
         * Get account details for currently logged in user.
         * @returns {promise}
         */
        getAccount: function () {
          var d = $q.defer();
          $http.get('/api/profile')
            .success(function (res) { d.resolve(res); });
          return d.promise;
        },
        /**
         * Update account details of currently logged in user.
         * @param json Settings in JSON format.
         * @returns {promise}
         */
        updateAccount: function (json) {
          var d = $q.defer();
          $http.post('/api/profile', json)
            .success(function () { d.resolve(true); });
          return d.promise;
        },
        // TODO: should receive 'old' and 'new' values
        changePassword: function (json) {
          var d = $q.defer();
          $http.post('/api/profile/password', json)
            .success(function (res) { d.resolve(res); })
            .error(function (err) { d.reject(err); });
          return d.promise;
        },
        /**
         * Changes email address for currently logged in user.
         * @param oldValue Old email.
         * @param newValue New email.
         * @returns {promise}
         */
        changeEmail: function (oldValue, newValue) {
          var d = $q.defer();
          $http.post('/api/profile/email', { oldValue: oldValue, newValue: newValue })
            .success(function (res) { d.resolve(res); })
            .error(function (err) { d.reject(err); });
          return d.promise;
        }
      };
    }]);