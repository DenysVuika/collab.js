angular.module('collabjs.services')
  .service('helpService', ['$http', '$q', function ($http, $q) {
    'use strict';
    return {
      getArticle: function (name) {
        var d = $q.defer();
        var query = (name) ? '/api/help/' + name : '/api/help';
        $http.get(query).success(function (data) { d.resolve(data); });
        return d.promise;
      }
    };
  }]);