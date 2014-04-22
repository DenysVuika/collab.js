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
        }
      };
    }
  ]);