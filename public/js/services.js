/*!
* collab.js v0.4.0
* Copyright (c) 2013 Denis Vuyka
* License: MIT
* http://www.opensource.org/licenses/mit-license.php
*/
angular.module('collabjs.services')
  .service('accountService', ['$http', '$q',
    function ($http, $q) {
      'use strict';
      return {
        createAccount: function (token, account, name, email, password) {
          var d = $q.defer()
            , data = { account: account, name: name, email: email, password: password }
            , options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
          $http.post('/api/account/register', data, options)
            .success(function (res) { d.resolve(res); })
            .error(function (res) { d.reject(res); });
          return d.promise;
        },
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
            .success(function (res) { d.resolve(res); })
            .error(function (data) { d.reject(data); });
          return d.promise;
        }
      };
    }]);
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
        login: function (token, username, password) {
          var deferred = $q.defer();

          $http.post('/api/auth/login',
            { username: username, password: password },
            { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' })
            .success(function (res) {
              _user = res;
              deferred.resolve(_user);
            })
            .error(function (data, status) {
              // status === 401 (Unauthorized)
              _user = false;
              deferred.reject(null);
            });

          return deferred.promise;
        },
        logout: function (token) {
          var deferred = $q.defer();

          $http.post('/api/auth/logout', null,
            { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' })
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
angular.module('collabjs.services')
  .service('peopleService', ['$http', '$q', function ($http, $q) {
    'use strict';
    var _people = [];
    return {
      getPeople: function () {
        var deferred = $q.defer();

        if (_people.length === 0) {
          $http.get('/api/people').success(function (data) {
            // TODO: return array instead of object
            _people = data.feed || [];
            deferred.resolve(_people);
          });
        } else {
          deferred.resolve(_people);
        }

        return deferred.promise;
      },
      getFollowing: function (account) {
        var d = $q.defer()
          , query = '/api/people/' + account + '/following';
        $http.get(query).success(function(data) { d.resolve(data); });
        return d.promise;
      },
      getFollowers: function (account) {
        var d = $q.defer()
          , query = '/api/people/' + account + '/followers';
        $http.get(query).success(function(data) { d.resolve(data); });
        return d.promise;
      },
      canFollow: function (profile) {
        return profile && !profile.isFollowed && !profile.isOwnProfile;
      },
      canUnfollow: function (profile) {
        return profile && profile.isFollowed && !profile.isOwnProfile;
      },
      getCountryName: function (profile) {
        if (profile && profile.location) {
          return collabjs.countries[profile.location.toUpperCase()];
        } else {
          return '';
        }
      },
      // TODO: moved to 'wallUrl' filter
      getProfileFeed: function (profile) {
        if (typeof profile === 'string') {
          return '/people/' + profile + '/timeline';
        }
        if (profile && profile.account) {
          return '/people/' + profile.account + '/timeline';
        }
        return null;
      },
      getFollowingUrl: function (profile) {
        return profile ? '/#/people/' + profile.account + '/following' : null;
      },
      getFollowersUrl: function (profile) {
        return profile ? '/#/people/' + profile.account + '/followers' : null;
      },
      follow: function (profile) {
        var followAction = '/api/people/' + profile.account + '/follow';
        $http.get(followAction).success(function () {
          profile.isFollowed = true;
        });
      },
      unfollow: function (profile) {
        var unfollowAction = '/api/people/' + profile.account + '/unfollow';
        $http.get(unfollowAction).success(function () {
          profile.isFollowed = false;
        });
      }
    };
  }]);
angular.module('collabjs.services')
  .service('postsService', ['$http', '$q', function ($http, $q) {
    'use strict';
    return {
      getNews: function (topId) {
        var d = $q.defer()
          , query = '/api/timeline/posts';
        if (topId) { query = query + '?topId=' + topId; }
        $http.get(query).success(function (data) { d.resolve(data || []); });
        return d.promise;
      },
      getNewsUpdatesCount: function (topId) {
        var d = $q.defer()
          , query = '/api/timeline/updates/count?topId=' + topId;
        $http.get(query)
          .success(function (data) { d.resolve(data.posts || 0); })
          .error(function () { d.resolve(0); });
        return d.promise;
      },
      getNewsUpdates: function (topId) {
        var d = $q.defer()
          , query = '/api/timeline/updates?topId=' + topId;
        $http.get(query).success(function (data) { d.resolve(data || []); });
        return d.promise;
      },
      getWall: function (account, topId) {
        var d = $q.defer()
          , query = '/api/people/' + account + '/timeline';
        if (topId) { query = query + '?topId=' + topId; }
        $http.get(query).success(function (data) { d.resolve(data); });
        return d.promise;
      },
      getMentions: function (topId) {
        var d = $q.defer()
          , query = '/api/mentions';
        if (topId) { query = query + '?topId=' + topId; }
        $http.get(query).success(function (data) { d.resolve(data || []); });
        return d.promise;
      },
      getPostById: function (postId) {
        var d = $q.defer()
          , query = '/api/timeline/posts/' + postId;
        $http.get(query)
          .success(function (res) { d.resolve(res); })
          .error(function (data) { d.reject(data); });
        return d.promise;
      },
      // TODO: turn into filter
      getPostUrl: function (postId) {
        return postId ? '/timeline/posts/' + postId : null;
      },
      getPostComments: function (postId) {
        var d = $q.defer();
        $http.get('/api/timeline/posts/' + postId + '/comments').success(function (data) {
          d.resolve(data);
        });
        return d.promise;
      },
      createPost: function (token, content) {
        var d = $q.defer()
          , post = { _csrf: token, content: content }
          , options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
        $http
          .post('/api/timeline/posts', post, options)
          .then(function (res) { d.resolve(res.data); });
        return d.promise;
      },
      addComment: function (token, postId, content) {
        var d = $q.defer()
          , comment = { _csrf: token, postId: postId, content: content }
          , options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
        $http
          .post('/api/timeline/comments', comment, options)
          .then(function (res) { d.resolve(res.data); });
        return d.promise;
      },
      deletePost: function (postId, token) {
        var d = $q.defer()
          , options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
        $http
          .delete('/api/timeline/posts/' + postId, options)
          .then(function (res) { d.resolve(res); });
        return d.promise;
      },
      loadPostComments: function (post, callback) {
        if (post && post.id) {
          $http.get('/api/timeline/posts/' + post.id + '/comments').success(function (data) {
            post.comments = data || [];
            if (callback) {
              callback(post);
            }
          });
        }
      }
    };
  }]);
angular.module('collabjs.services')
  .service('profileService', [
    function () {
      'use strict';
      return {
        profilePictureUrl: function () {
          return  collabjs.currentUser.pictureUrl;
        }
      };
    }
  ]);
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