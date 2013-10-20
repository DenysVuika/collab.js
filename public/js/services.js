angular.module('collabjs.services', ['ngResource'])
  .service('profileService', function () {
    'use strict';
    return {
      profilePictureUrl: function () {
        return collabjs.currentUser.getPictureUrl();
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
        return profile ? '/people/' + profile.account + '/following' : null;
      },
      getFollowersUrl: function (profile) {
        return profile ? '/people/' + profile.account + '/followers' : null;
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
      getPostContent: function (post) {
        return post ? post.content.twitterize() : null;
      },
      getPostComments: function (postId) {
        var d = $q.defer();
        $http.get('/api/timeline/posts/' + postId + '/comments').success(function (data) {
          d.resolve(data);
        });
        return d.promise;
      },
      addComment: function (comment) {
        var d = $q.defer();
        $http.post(
          '/api/timeline/comments',
          comment,
          { xsrfHeaderName : 'x-csrf-token' }
        ).then(function (res) { d.resolve(res.data); });
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