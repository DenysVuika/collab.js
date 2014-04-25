angular.module('collabjs.services')
  .service('adminService', ['$http', '$q',
    function ($http, $q) {
      'use strict';
      return {
        /**
         * List registered accounts.
         * @returns {promise}
         */
        getAccounts: function () {
          var d = $q.defer();
          $http.get('/api/admin/accounts')
            .success(function (res) { d.resolve(res || []); });
          return d.promise;
        },
        /**
         * Create new account
         * @param {string} account Account name.
         * @param {string} name Public user name.
         * @param {string} email Email address.
         * @param {string} password Password.
         * @returns {promise} Deferred promise object.
         */
        createAccount: function (account, name, email, password) {
          var d = $q.defer()
            , data = { account: account, name: name, email: email, password: password };
          $http
            .post('/api/admin/accounts', data)
            .success(function (res) { d.resolve(res); })
            .error(function (err) { d.reject(err); });
          return d.promise;
        },
        /**
         * Get account by account name.
         * @param {string} account Account name.
         * @returns {promise} Deferred promise object.
         */
        getAccount: function (account) {
          var d = $q.defer();
          $http
            .get('/api/admin/accounts/a/' + account)
            .success(function (res) {d.resolve(res); })
            .error(function (err) {d.reject(err); });
          return d.promise;
        },
        /**
         * Delete account by account name.
         * @param {string} account Account name.
         * @returns {promise} Deferred promise object.
         */
        deleteAccount: function (account) {
          var d = $q.defer();
          $http
            .delete('/api/admin/accounts/a/' + account)
            .then(
              function (res) { d.resolve(res); },
              function (err) { d.reject(err); }
            );
          return d.promise;
        },
        /**
         * Update existing account.
         * @param {string} account Account name.
         * @param {object} data Account data in JSON format.
         * @returns {promise} Deferred promise object.
         */
        updateAccount: function (account, data) {
          var d = $q.defer();
          $http
            .post('/api/admin/accounts/a/' + account, data)
            .success(function (res) {d.resolve(res); })
            .error(function (err) {d.reject(err); });
          return d.promise;
        }
      };
    }
  ]);