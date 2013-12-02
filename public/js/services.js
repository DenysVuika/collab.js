angular.module('collabjs.services', ['ngResource'])
  .service('accountService', function ($http, $q) {
    'use strict';
    return {
      getAccount: function () {
        var d = $q.defer();
        $http.get('/api/account').success(function (data) { d.resolve(data); });
        return d.promise;
      },
      updateAccount: function (token, data) {
        var d = $q.defer();
        var options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
        $http.post('/api/account', data, options).success(function (res) { d.resolve(true); });
        return d.promise;
      },
      changePassword: function (token, data) {
        var d = $q.defer();
        var options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
        $http.post('/api/account/password', data, options)
          .success(function (res) { console.log(res); d.resolve(res); })
          .error(function (data, status, headers, config) { d.reject(data); });
        return d.promise;
      }
    };
  })
  .service('profileService', function () {
    'use strict';
    return {
      profilePictureUrl: function () {
        return  collabjs.currentUser.pictureUrl;
      }
    };
  })
  .service('peopleService', function ($http, $q) {
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
        var d = $q.defer();
        var query = '/api/people/' + account + '/following';
        $http.get(query).success(function(data) { d.resolve(data); });
        return d.promise;
      },
      getFollowers: function (account) {
        var d = $q.defer();
        var query = '/api/people/' + account + '/followers';
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
        //return profile ? '/people/' + profile.account + '/following' : null;
        return profile ? '/#/people/' + profile.account + '/following' : null;
      },
      getFollowersUrl: function (profile) {
        //return profile ? '/people/' + profile.account + '/followers' : null;
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
  })
  .service('postsService', function ($http, $q) {
    'use strict';
    return {
      getNews: function (topId) {
        var d = $q.defer();
        var query = '/api/timeline/posts';
        if (topId) { query = query + '?topId=' + topId; }
        $http.get(query).success(function (data) { d.resolve(data || []); });
        return d.promise;
      },
      getNewsUpdatesCount: function (topId) {
        var d = $q.defer();
        var query = '/api/timeline/updates/count?topId=' + topId;
        $http.get(query)
          .success(function (data) { d.resolve(data.posts || 0); })
          .error(function (data) { d.resolve(0); });
        return d.promise;
      },
      getNewsUpdates: function (topId) {
        var d = $q.defer();
        var query = '/api/timeline/updates?topId=' + topId;
        $http.get(query).success(function (data) { d.resolve(data || []); });
        return d.promise;
      },
      getWall: function (account, topId) {
        var d = $q.defer();
        var query = '/api/people/' + account + '/timeline';
        if (topId) { query = query + '?topId=' + topId; }
        $http.get(query).success(function (data) { d.resolve(data); });
        return d.promise;
      },
      getMentions: function (topId) {
        var d = $q.defer();
        var query = '/api/mentions';
        if (topId) { query = query + '?topId=' + topId; }
        $http.get(query).success(function (data) { d.resolve(data || []); });
        return d.promise;
      },
      getPostById: function (postId) {
        var d = $q.defer();
        var query = '/api/timeline/posts/' + postId;
        $http.get(query)
          .success(function (res) { d.resolve(res); })
          .error(function (data) { d.reject(data); });

        return d.promise;
      },
      getPostUrl: function (postId) {
        return postId ? '/timeline/posts/' + postId : null;
      },
      /* TODO: remove
      getPostContent: function (post) {
        return post ? post.content.twitterize() : null;
      },
      */
      getPostComments: function (postId) {
        var d = $q.defer();
        $http.get('/api/timeline/posts/' + postId + '/comments').success(function (data) {
          d.resolve(data);
        });
        return d.promise;
      },
      createPost: function (token, content) {
        var d = $q.defer();
        var post = { _csrf: token, content: content };
        var options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
        $http
          .post('/api/timeline/posts', post, options)
          .then(function (res) { d.resolve(res.data); });
        return d.promise;
      },
      addComment: function (token, postId, content) {
        var d = $q.defer();
        var comment = { _csrf: token, postId: postId, content: content };
        var options = { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' };
        $http
          .post('/api/timeline/comments', comment, options)
          .then(function (res) { d.resolve(res.data); });
        return d.promise;
      },
      deletePost: function (postId, token) {
        var d = $q.defer();
        $http
          .delete('/api/timeline/posts/' + postId,
            { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' })
          .then(function (res) { d.resolve(res); });
        return d.promise;
      },
      loadPostComments: function (post) {
        if (post && post.id) {
          $http.get('/api/timeline/posts/' + post.id + '/comments').success(function (data) {
            post.comments = data || [];
          });
        }
      }
    };
  })
  .service('searchService', function ($http, $q) {
    'use strict';
    return {
      saveList: function (token, q, src) {
        var d = $q.defer();
        var payload = { action: 'save', q: q, src: src };
        $http
          .post('/search', payload,
            { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' })
          .then(function (res) { d.resolve(res); });
        return d.promise;
      },
      deleteList: function (token, q, src) {
        var d = $q.defer();
        var payload = { action: 'delete', q: q, src: src };
        $http
          .post('/search', payload,
            { headers: { 'x-csrf-token': token }, xsrfHeaderName : 'x-csrf-token' })
          .then(function (res) { d.resolve(res); });
        return d.promise;
      },
      searchPosts: function (q, src, topId) {
        var d = $q.defer();
        var query = '/api/search?q=' + encodeURIComponent(q) + '&src=' + src;
        if (topId) { query = query + '&topId=' + topId; }
        $http
          .get(query)
          .then(function (res) { d.resolve(res.data || []); });

        return d.promise;
      }
    };
  });