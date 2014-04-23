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
         * @returns {promise}
         */
        createAccount: function (account, name, email, password) {
          var d = $q.defer()
            , data = { account: account, name: name, email: email, password: password };
          $http.post('/api/admin/accounts', data)
            .success(function (res) { d.resolve(res); })
            .error(function (err) { d.reject(err); });
          return d.promise;
        }
      };
    }
  ]);