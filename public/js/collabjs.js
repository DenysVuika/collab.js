/* global ko, moment */
/// <reference path="../lib/jQuery/js/jquery.min.js" />
/// <reference path="../lib/bootstrap/js/bootstrap.js" />
/// <reference path="../lib/knockout/js/knockout.min.js" />
/// <reference path="../lib/moment/js/moment.min.js" />

var collabjs = collabjs || {
  // value may be assigned based on server-side settings
  avatarServer: 'https://www.gravatar.com',
  currentUser: {
    id: null,
    account: null,
    pictureId: null,
    getPictureUrl: function () {
      'use strict';
      return collabjs.getUserPicture(collabjs.currentUser.pictureId, 48);
    }
  },
  getUserPicture: function(pictureId, pictureSize) {
    'use strict';
    return collabjs.avatarServer + '/avatar/' + pictureId + '?s=' + (pictureSize || '48');
  },
  // ui-related members
  ui: {},
  utils: {
    isNullOrWhiteSpace: function (str) {
      'use strict';
      return str === null || str.match(/^ *$/) !== null;
    }
  }
};

/*
  jQuery plugin: Twitter-like dynamic character countdown for textareas

   Example:

      $('#textarea').countdown({
        limit: 140,
        init: function(counter){
          $('#counter').css('color','#999999').val(counter);
          $('#submit').attr('disabled','disabled');
        },
        plus: function(counter){
          $('#counter').css('color','#999999').val(counter);
          $('#submit').removeAttr('disabled');
        },
        minus: function(counter){
          $('#counter').css('color','red').val(counter);
          $('#submit').attr('disabled','disabled');
        }
      });
*/

(function($) {
  'use strict';
  $.fn.countdown = function(config) {
    var options = $.extend($.fn.countdown.defaults, config);
    
    function updateUi(sender) {
      var available = options.limit - $(sender).val().length;
      var counter = options.prefix + available + options.suffix;
      if (counter >= 0) {
        options.plus(counter);
      } else {
        options.minus(counter);
      }
    }

    updateUi($(this));

    return this.each(function () {

      $(this).bind("keyup change", function() {
        if (!$(this).val().length) {
          options.init(options.limit);
          return;
        }
        updateUi($(this));
      });
    });
  };

  $.fn.countdown.defaults = {
    limit: 160,
    init: function (counter) { },
    plus: function (counter) { },
    minus: function (counter) { },
    prefix: '',
    suffix: ''
  };
})(jQuery);


$(function () {
  'use strict';
  /* Knockout extensions */
  ko.bindingHandlers.country = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // This will be called when the binding is first applied to an element
      // Set up any initial state, event handlers, etc. here
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      // This will be called once when the binding is first applied to an element,
      // and again whenever the associated observable changes value.
      // Update the DOM element based on the supplied values here.
      var $element = $(element);
      var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());
      // show only when value is provided
      if (valueUnwrapped && valueUnwrapped.length > 0) {
        $element.css('display', 'block');
        $element.attr('data-country', valueUnwrapped);
        $element.bfhcountries($element.data());
      } else {
        $element.css('display', 'none');
      }
    }
  };
});



/* String extensions */
String.prototype.formatString = function() {
  'use strict';
  var formatted = this;
  for (var i = 0; i < arguments.length; i++) {
    var regexp = new RegExp('\\{' + i + '\\}', 'gi');
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};

String.prototype.parseUrls = function () {
  'use strict';
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
    return url.link(url);
  });
};

String.prototype.parseHashTags = function () {
  'use strict';
  return this.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
    var tag = t.replace("#", "%23");
    //return t.link("http://search.twitter.com/search?q=" + tag);
    return t.link('/search?q=' + tag + '&src=hash');
  });
};

String.prototype.parseAccountTags = function () {
  'use strict';
  return this.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
    var username = u.replace("@", "");
    //return u.link("http://twitter.com/" + username);
    return "<a href='/people/" + username + "/timeline'>" + u + "</a>";
  });
};

String.prototype.getHashTags = function () {
  'use strict';
  var result = this.match(/[#]+[A-Za-z0-9-_]+/g);
  return result ? result : [];
};

String.prototype.twitterize = function () {
  'use strict';
  return this
    .parseUrls()
    .parseAccountTags()
    .parseHashTags();
};

// ========================================================================================
// View Models
// ========================================================================================

function PostViewModel(data) {
  'use strict';
  var self = this;
  self.id = data.id;
  self.account = data.account;
  self.name = data.name;
  self.content = data.content.twitterize();
  self.created = moment(data.created);
  self.hashtags = data.content.getHashTags();
  self.picture = collabjs.getUserPicture(data.pictureId, data.pictureSize);
  self.feed = '/people/' + data.account + '/timeline';
  self.isOwnPost = (data.account === collabjs.currentUser.account);
  self.postUrl = '/timeline/posts/' + data.id;

  self.commentsCount = ko.observable(data.commentsCount ? data.commentsCount : 0);
  self.comments = ko.observableArray([]);
  self.commentsLoading = ko.observable(false);
  self.commentsLoaded = false;
  self.openBlank = false;

  // sorts comments by creation date in descending order
  self.sortComments = function () {
    self.comments.sort(function (left, right) {
      return left.created === right.created ? 0 : (left.created < right.created ? -1 : 1);
    });
  };
}

function FeedViewModel(data) {
  'use strict';
  var self = this;

  self.posts = ko.observableArray([]);


  // if post belongs to current user then post is removed
  // otherwise, post is marked as hidden
  self.dismissPost = function (post) {
    var token = $('#csrf_token').val();
    $.ajax({
      url: '/api/timeline/posts/' + post.id,
      type: 'DELETE',
      headers: { 'x-csrf-token': token },
      success: function () {
        self.posts.remove(post);
        // Raise event to notify external components
        $(document).trigger("collabjs.onPostRemoved", data);
      }
    });
  };

  self.addNewPost = function (post) {
    var viewmodel = new PostViewModel(post);
    self.posts.unshift(viewmodel);
  };

  self.createPost = function (data) {
    var viewmodel = new PostViewModel(data);

    if (data.comments && data.comments.length > 0) {
      var entries = ko.utils.arrayMap(data.comments, function (entry) {
        return new PostViewModel({
          id: entry.id,
          account: entry.account,
          name: entry.name,
          content: entry.content,
          created: entry.created,
          //pictureSize: 32,
          pictureSize: 48,
          pictureId: entry.pictureId
        });
      });
      viewmodel.comments(entries);
      viewmodel.commentsLoaded = true;
    }
    viewmodel.openBlank = viewmodel.commentsLoaded === false && viewmodel.commentsCount() > 9;
    return viewmodel;
  };

  self.addPost = function (data) {
    var viewmodel = self.createPost(data);
    self.posts.push(viewmodel);
  };

  self.appendPosts = function (posts) {
    var newItems = ko.utils.arrayMap(posts, function (entry) {
      return self.createPost(entry);
    });
    self.posts.push.apply(self.posts, newItems);
  };

  self.appendPosts(data);
}

function UserProfileViewModel(data) {
  'use strict';
  var self = this;
  self.id = data.id;
  self.account = data.account;
  self.name = data.name;
  self.location = data.location;
  self.website = data.website;
  self.bio = data.bio;
  self.posts = data.posts;
  self.followers = data.followers;
  self.followersUrl = '/people/' + data.account + '/followers';
  self.following = data.following;
  self.followingUrl = '/people/' + data.account + '/following';
  self.isFollowed = ko.observable(data.isFollowed);
  self.picture = collabjs.getUserPicture(data.pictureId);
  self.feed = '/people/' + data.account + '/timeline';
  self.followAction = '/api/people/' + data.account + '/follow';
  self.unfollowAction = '/api/people/' + data.account + '/unfollow';
  self.isOwnProfile = data.isOwnProfile;
}

function PeopleViewModel(data) {
  'use strict';
  var self = this;
  self.profiles = ko.observableArray([]);

  self.appendItems = function (items) {
    var newItems = ko.utils.arrayMap(items, function (entry) {
      return new UserProfileViewModel(entry);
    });
    self.profiles.push.apply(self.profiles, newItems);
  };

  self.follow = function (profile) {
    $.get(profile.followAction, function () {
      profile.isFollowed(true);
    });
  };

  self.unfollow = function (profile) {
    $.get(profile.unfollowAction, function () {
      profile.isFollowed(false);
    });
  };

  self.appendItems(data);
}

// ========================================================================================
// Common Functions
// ========================================================================================

collabjs.ui.onPeopleDataLoaded = function (data) {
  'use strict';
  if (!data) {
    data = [];
  }
  if (!window.peopleFeed) {
    window.peopleFeed = new PeopleViewModel(data);
    ko.applyBindings(window.peopleFeed);
  } else {
    window.peopleFeed.appendItems(data);
  }
};

collabjs.ui.onFeedDataLoaded = function (data) {
  'use strict';
  if (!data) {
    data = [];
  }
  if (!window.timelineFeed) {
    window.timelineFeed = new FeedViewModel(data);
    ko.applyBindings(window.timelineFeed);
  } else {
    window.timelineFeed.appendPosts(data);
  }
  collabjs.ui.enableCommentExpanders();
};

$(document).bind("collabjs.onStatusUpdated", function (event, data) {
  'use strict';
  var feed = window.timelineFeed;
  if (data && feed && data.account === collabjs.currentUser.account) {
    window.timelineFeed.addNewPost(data);
  }
});

// ========================================================================================
// Comment expanders
// ========================================================================================

collabjs.ui.enableCommentExpanders = function () {
  'use strict';
  var comments = $('a[data-link-type="comment"]');
  comments.unbind('click', onCommentsExpanded);
  comments.bind('click', onCommentsExpanded);

  function onCommentsExpanded(e) {
    e.preventDefault();
    var sender = $(e.target);
    var post = ko.dataFor(sender[0]);

    if (!post.commentsLoading()) {
      post.commentsLoading(true);
      $.ajax({
        url: '/api/timeline/posts/' + post.id + '/comments',
        dataType: "json",
        success: function (data) {
          onCommentsLoaded(post, data);
        }
      });
    }
  }

  function onCommentsLoaded(post, data) {
    post.commentsLoading(false);
    // TODO: provide latest comment date/id in order for server returning only delta
    //post.comments.removeAll();
    if (data) {
      post.commentsCount(data.length);
      var newItems = ko.utils.arrayMap(data, function (entry) {
        return new PostViewModel({
          id: entry.id,
          account: entry.account,
          name: entry.name,
          content: entry.content,
          created: entry.created,
          pictureSize: 32,
          pictureId: entry.pictureId
        });
      });
      post.comments(newItems);
    } else {
      post.comments([]);
    }
  }
};

collabjs.ui.doPostComment = function (form) {
  'use strict';
  var formData = $(form).serialize();
  $.post('/api/timeline/comments', formData, function (data) {
    var editor = $("#comment-box-" + data.postId);
    var post = ko.dataFor(editor[0]);

    post.commentsCount(post.commentsCount() + 1);
    // turn comments into PostViewModel instances (as per current design)
    post.comments.push(new PostViewModel({
      id: data.id,
      account: data.account,
      name: data.name,
      content: data.content,
      created: data.created,
      pictureSize: 32,
      pictureId: data.pictureId
    }));
    post.sortComments();
    editor.val("");
  });
};

// ========================================================================================
// Register
// ========================================================================================

collabjs.ui.initRegisterView = function () {
  'use strict';
  $(function() {
    $("input").not(["type=submit"]).jqBootstrapValidation();
  });
};

// ========================================================================================
// Change Password
// ========================================================================================

collabjs.ui.initChangePasswordView = function () {
  'use strict';
  $(function() {
    $("input").not(["type=submit"]).jqBootstrapValidation();
  });
};

// ========================================================================================
// Post Viewer
// ========================================================================================

collabjs.ui.initPostView = function (id) {
  'use strict';
  $(document).ready(function () {
    var spinner = $('.page-spinner');
    spinner.show();

    $.ajax({
      type: 'GET',
      url: '/api/timeline/posts/' + id,
      success: onPostLoaded,
      error: function () {
        $('.page-error').text('Post not found.').show();
      },
      complete: function() {
        spinner.hide();
      }
    });
  });

  function onPostLoaded(data) {
    if (data) {
      window.viewmodel = new FeedViewModel([data]);
      ko.applyBindings(window.viewmodel);
    } else {
      $('.page-error').text('Post not found.').show();
    }
  }
};

// ========================================================================================
// Timeline
// ========================================================================================

collabjs.ui.initTimeline = function () {
  'use strict';
  $(document).ready(function () {
    // load first page of posts
    $.get('/api/timeline/posts', collabjs.ui.onFeedDataLoaded);
    // init smooth infinite scrolling
    // (downloads additional posts as soon as user scrolls to the bottom)
    initLazyLoading(function (posts) {
      var bottomPostId = Math.min.apply(this, $.map(window.timelineFeed.posts(), function (p) {
        return p.id;
      }));
      return '/api/timeline/posts?topId=' + bottomPostId;
    }, collabjs.ui.onFeedDataLoaded);
    // start polling timer
    checkNewPosts();
  });

  function onUpdatesLoaded(data) {
    if (data && window.timelineFeed) {
      $(data).each(function(index, post) {
        window.timelineFeed.addNewPost(post);
      });
      collabjs.ui.enableCommentExpanders();
    }
  }

  // update polling
  var updateChecker;

  function checkNewPosts() {
    clearTimeout(updateChecker);
    updateChecker = setTimeout(function() {
      var topId = Math.max.apply(this, $.map(window.timelineFeed.posts(), function(o) { return o.id; }));
      var notifier = $("#msg-new-posts");
      $.get('/api/timeline/updates/count?topId=' + topId, function(data) {
        if (data && data.posts && data.posts > 0) {
          $("#new-msg-counter").text(data.posts);
          notifier.show();
        }
        else {
          notifier.hide();
        }
      }, "json")
        .always(function() {
          checkNewPosts();
        });
    }, 60000); // once per minute
  }

  // Clicking to download new posts
  $("#new-msg-link").on("click", function(e) {
    e.preventDefault();
    $("#msg-new-posts").hide();
    clearTimeout(updateChecker);
    var topId = Math.max.apply(this, $.map(window.timelineFeed.posts(), function(o) { return o.id; }));
    $.get('/api/timeline/updates?topId=' + topId, function(data) {
      onUpdatesLoaded(data);
    }, "json")
      .always(function() {
        checkNewPosts();
      });
  });
};

collabjs.ui.doUpdateStatus = function (form) {
  'use strict';
  var f = $(form);
  var data = f.serialize();
  var input = f.find(':input');
  input.attr('disabled', true);
  $.post('/api/timeline/posts', data, function (result) {
    input.removeAttr('disabled');
    f.find('textarea').val('');
    $(document).trigger("collabjs.onStatusUpdated", result);
  });
};

// ========================================================================================
// Mentions
// ========================================================================================
collabjs.ui.initMentions = function () {
  'use strict';
  $(document).ready(function () {
    // get first page for mentions
    $.get('/api/mentions', collabjs.ui.onFeedDataLoaded);
    // init smooth infinite scrolling
    //  (downloads additional posts as soon as user scrolls to the bottom)
    initLazyLoading(function () {
      var bottomPostId = Math.min.apply(this, $.map(window.timelineFeed.posts(), function (p) {
        return p.id;
      }));
      return '/api/mentions?topId=' + bottomPostId;
    }, collabjs.ui.onFeedDataLoaded);
  });
};

// ========================================================================================
// People
// ========================================================================================

collabjs.ui.initPeople = function () {
  'use strict';
  $(document).ready(function () {
    // get first page for people hub
    $.get('/api/people', collabjs.ui.onPeopleDataLoaded);
    // smooth infinite scrolling
    // (downloads additional posts as soon as user scrolls to bottom)
    initLazyLoading(function () {
      var bottomUserId = Math.max.apply(this, $.map(window.peopleFeed.profiles(), function (u) {
        return u.id;
      }));
      return '/api/people?topId=' + bottomUserId;
    }, collabjs.ui.onPeopleDataLoaded);
  });
};

// ========================================================================================
// Followers
// ========================================================================================

collabjs.ui.initFollowers = function (account) {
  'use strict';
  $(document).ready(function () {
    // get first page of followers for the given account
    $.get('/api/people/' + account + '/followers', collabjs.ui.onPeopleDataLoaded);

    // smooth infinite scrolling
    // (downloads additional posts as soon as user scrolls to bottom)
    initLazyLoading(function () {
      var bottomUserId = Math.max.apply(this, $.map(window.peopleFeed.profiles(), function (u) {
        return u.id;
      }));
      return '/api/people/' + account + '/followers?topId=' + bottomUserId;
    }, collabjs.ui.onPeopleDataLoaded);
  });
};

// ========================================================================================
// Following
// ========================================================================================

collabjs.ui.initFollowing = function (account) {
  'use strict';
  $(document).ready(function () {
    // get first page of followings for the given account
    $.get('/api/people/' + account + '/following', collabjs.ui.onPeopleDataLoaded);
    // smooth infinite scrolling
    // (downloads additional posts as soon as user scrolls to bottom)
    initLazyLoading(function () {
      var bottomUserId = Math.max.apply(this, $.map(window.peopleFeed.profiles(), function (u) {
        return u.id;
      }));
      return '/api/people/' + account + '/following?topId=' + bottomUserId;
    }, collabjs.ui.onPeopleDataLoaded);
  });
};

// ========================================================================================
// Personal Timeline
// ========================================================================================

collabjs.ui.initPersonalTimeline = function (account) {
  'use strict';
  $(document).ready(function () {
    // get first page of people for the given account
    $.get('/api/people/' + account + '/timeline', collabjs.ui.onFeedDataLoaded);
    // smooth infinite scrolling
    //  (downloads additional posts as soon as user scrolls to the bottom)
    initLazyLoading(function () {
      var bottomPostId = Math.min.apply(this, $.map(window.timelineFeed.posts(), function (p) {
        return p.id;
      }));
      return '/api/people/' + account + '/timeline?topId=' + bottomPostId;
    }, collabjs.ui.onFeedDataLoaded);
  });
};

// ========================================================================================
// Account
// ========================================================================================

collabjs.ui.initAccountView = function () {
  'use strict';
  $(document).ready(function () {
    // init bio editor

    $('#bio').countdown({
      limit: 160,
      init: function (counter) {
        $('#bio_counter').css('color', '#999').text(counter);
      },
      plus: function (counter) {
        $('#bio_counter').css('color', '#999').text(counter);
        $('#submit').removeAttr('disabled');
      },
      minus: function (counter) {
        $('#bio_counter').css('color', 'red').text(counter);
        $('#submit').attr('disabled', 'disabled');
      }
    });
  });
};

// ========================================================================================
// Search Posts
// ========================================================================================

collabjs.ui.initSearchPosts = function (q, src) {
  'use strict';
  $(document).ready(function () {
    // search posts
    $.get('/api/search?q=' + encodeURIComponent(q) + '&src=' + src, collabjs.ui.onFeedDataLoaded);
    // smooth infinite scrolling
    //  (downloads additional posts as soon as user scrolls to the bottom)
    initLazyLoading(function () {
      var bottomPostId = Math.min.apply(this, $.map(window.timelineFeed.posts(), function (p) {
        return p.id;
      }));
      return '/api/search?q=' + encodeURIComponent(q) + '&src=' + src + '&topId=' + bottomPostId;
    }, collabjs.ui.onFeedDataLoaded);
  });
};

// ========================================================================================
// Smooth/infinite loading
// ========================================================================================

var _page = 0;
var _inCallback = false;

function initLazyLoading(url, onSuccess) {
  'use strict';
  $(window).scroll(function () {
    if ($(window).scrollTop() === $(document).height() - $(window).height()) {
      if (_page > -1 && !_inCallback) {
        _inCallback = true;
        _page++;

        var pageSpinner = $('.page-spinner');
        var pageError = $('.page-error');
        
        pageSpinner.show();
        pageError.hide();

        $.ajax({
          type: "GET",
          dataType: "json",
          url: url(_page),
          timeout: 5000,
          success: function (data) {
            // check whether any posts are loaded
            if (data.length > 0) {
              if (onSuccess && (typeof onSuccess === "function")) {
                onSuccess(data);
              }
            }
            else {
              // otherwise stop further attempts loading data as we reached the end
              _page = -1;
            }
          },
          error: function () {
            pageError.text("Error getting data. There seems to be a server problem, please try again later.");
            pageError.show();
            _page--;
          },
          complete: function () {
            _inCallback = false;
            pageSpinner.hide();
          }
        });
      }
    }
  });
}