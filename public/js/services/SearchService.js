angular.module('collabjs.services')
  .service('searchService', ['$rootScope', '$http', '$q',
      function ($rootScope, $http, $q) {
        'use strict';
        return {
          getLists: function () {
            var d = $q.defer()
              , query = '/api/search/list';
            $http.get(query)
              .success(function (res) {
                var lists = (res || []).map(function (l) {
                  l.url = '/#/search?q=' + l.q + '&src=' + l.src;
                  return l;
                });
                d.resolve(lists);
              })
              .error(function (data) { d.reject(data); });
            return d.promise;
          },
          saveList: function (token, q, src) {
            var d = $q.defer()
              , query = '/api/search?q=' + encodeURIComponent(q) + '&src=' + src
              , options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
            $http
              .post(query, null, options)
              .success(function () {
                d.resolve(true);
                $rootScope.$broadcast('listSaved@searchService', {
                  name: q,
                  q: encodeURIComponent(q),
                  src: src,
                  url: '/#/search?q=' + encodeURIComponent(q) + '&src=' + src
                });
              })
              .error(function (err) { d.resolve(err); });
            return d.promise;
          },
          deleteList: function (token, q, src) {
            var d = $q.defer()
              , query = '/api/search?q=' + encodeURIComponent(q) + '&src=' + src
              , options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
            $http
              .delete(query, options)
              .success(function () {
                d.resolve(true);
                $rootScope.$broadcast('listDeleted@searchService', {
                  name: q,
                  q: encodeURIComponent(q),
                  src: src,
                  url: '/#/search?q=' + encodeURIComponent(q) + '&src=' + src
                });
              })
              .error(function (err) { d.resolve(err); });
            return d.promise;
          },
          searchPosts: function (q, src, topId) {
            var d = $q.defer()
              , query = '/api/search?q=' + encodeURIComponent(q) + '&src=' + src;
            if (topId) { query = query + '&topId=' + topId; }
            $http
              .get(query)
              .then(function (res) { d.resolve(res.data || []); });

            return d.promise;
          }
        };
      }]);