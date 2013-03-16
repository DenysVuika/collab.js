/* global ko, moment */
/// <reference path="jquery-1.8.3.js" />
/// <reference path="bootstrap.js" />
/// <reference path="knockout-2.2.0.js" />
/// <reference path="moment.js" />

var _currentUser = null;
var _currentUserId = null;

function isNullOrWhiteSpace(str) {
  return str === null || str.match(/^ *$/) !== null;
}

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

/* String extensions */
String.prototype.formatString = function() {
  var formatted = this;
  for (var i = 0; i < arguments.length; i++) {
    var regexp = new RegExp('\\{' + i + '\\}', 'gi');
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};

String.prototype.parseUrls = function () {
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
    return url.link(url);
  });
};

String.prototype.parseHashTags = function () {
  return this.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
    var tag = t.replace("#", "%23");
    //return t.link("http://search.twitter.com/search?q=" + tag);
    return t.link('/search?q=' + tag + '&src=hash');
  });
};

String.prototype.parseAccountTags = function () {
  return this.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
    var username = u.replace("@", "");
    //return u.link("http://twitter.com/" + username);
    return "<a href='/people/" + username + "/timeline' data-link-type='account' data-link-value='" + username + "'>" + u + "</a>";
  });
};

String.prototype.getHashTags = function () {
  var result = this.match(/[#]+[A-Za-z0-9-_]+/g);
  return result ? result : [];
};

String.prototype.twitterize = function () {
  return this
    .parseUrls()
    .parseAccountTags()
    .parseHashTags();
};

// ========================================================================================
// View Models
// ========================================================================================

function PostViewModel(data) {
  var self = this;
  self.id = data.id;
  self.account = data.account;
  self.name = data.name;
  self.content = data.content.twitterize();
  self.created = moment(data.created);
  self.hashtags = data.content.getHashTags();
  self.picture = 'https://www.gravatar.com/avatar/' + data.pictureId + '?s=' + (data.pictureSize || '48');
  self.feed = '/people/' + data.account + '/timeline';
  self.canDismiss = false;
  self.postUrl = '/timeline/posts/' + data.id;

  self.commentsCount = ko.observable(data.commentsCount ? data.commentsCount : 0);
  self.comments = ko.observableArray([]);
  self.commentsLoading = ko.observable(false);
  self.commentsLoaded = false;
  self.openBlank = false;

  // sorts comments by creation date in descending order
  self.sortComments = function () {
    self.comments.sort(function (left, right) {
      var result = left.created === right.created ? 0 : (left.created < right.created ? -1 : 1);
      return result;
    });
  };
}

// Passing account is no longer relevant, use _currentUser instead
function FeedViewModel(account, data) {
  var self = this;

  self.account = account;
  self.posts = ko.observableArray([]);

  self.removePost = function (post) {
    $.ajax({
      dataType: 'json',
      url: '/api/timeline/posts/' + post.id,
      type: 'DELETE',
      success: function () {
        self.posts.remove(post);
        // Raise event to notify external components
        $(document).trigger("collabjs.onPostRemoved", data);
      }
    });
  };

  self.addNewPost = function (post) {
    var viewmodel = new PostViewModel(post);
    viewmodel.canDismiss = (post.account === account);
    self.posts.unshift(viewmodel);
  };

  self.addPost = function (post) {
    var viewmodel = new PostViewModel(post);
    viewmodel.canDismiss = (post.account === account);

    if (post.comments && post.comments.length > 0) {
      $(post.comments).each(function (index, entry) {
        viewmodel.comments.push(new PostViewModel({
          id: entry.id,
          account: entry.account,
          name: entry.name,
          content: entry.content,
          created: entry.created,
          pictureSize: 32,
          pictureId: entry.pictureId
        }));
      });

      viewmodel.commentsLoaded = true;
    }

    viewmodel.openBlank = viewmodel.commentsLoaded === false && viewmodel.commentsCount() > 9;
    self.posts.push(viewmodel);
  };

  self.appendPosts = function (posts) {
    $(posts).each(function (index, entry) {
      self.addPost(entry);
    });
  };

  self.appendPosts(data);
}

function UserProfileViewModel(data) {
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
  self.isFollowed = data.isFollowed;
  self.picture = 'https://www.gravatar.com/avatar/' + data.pictureId + '?s=48';
  self.feed = '/people/' + data.account + '/timeline';
  self.followAction = '/people/' + data.account + '/follow';
  self.unfollowAction = '/people/' + data.account + '/unfollow';
  self.isOwnProfile = data.isOwnProfile;
}

function PeopleViewModel(data) {
  var self = this;
  self.profiles = ko.observableArray([]);

  self.appendItems = function (items) {
    $(items).each(function (index, entry) {
      var viewmodel = new UserProfileViewModel(entry);
      self.profiles.push(viewmodel);
    });
  };

  self.appendItems(data);
}

// ========================================================================================
// Functions
// ========================================================================================

function onPeopleDataLoaded(data) {
  if (!window.peopleFeed) {
    window.peopleFeed = new PeopleViewModel(data);
    ko.applyBindings(window.peopleFeed);
  }
  else {
    window.peopleFeed.appendItems(data);
  }
}

function onFeedDataLoaded(data, account) {
  if (!data) { return; }
  if (!window.timelineFeed) {
    window.timelineFeed = new FeedViewModel(account, data);
    ko.applyBindings(window.timelineFeed);
  } else {
    window.timelineFeed.appendPosts(data);
  }
  enableCommentExpanders();
  enableAccountPopups();
  enableAccountTooltips();
}

$(document).bind("collabjs.onStatusUpdated", function (event, data) {
  var feed = window.timelineFeed;
  if (data && feed && data.account === feed.account) {
    window.timelineFeed.addNewPost(data);
    enableAccountPopups();
    enableAccountTooltips();
  }
});

// ========================================================================================
// Account link tooltips
// ========================================================================================

function enableAccountTooltips() {
  $('a[data-link-type="account"]').each(function () {
    var link = $(this);
    link.popover({
      placement: 'right',
      trigger: 'hover',
      title: '@' + link.attr("data-link-value"),
      delay: 600,
      content: 'Show status updates posted by this user.'
    });
  });
}

// ========================================================================================
// Comment expanders
// ========================================================================================

function enableCommentExpanders() {
  $('div[data-link-type="comment"]').each(function () {
    var link = $(this);
    link
      .unbind("shown", onCommentsExpanded)
      .bind("shown", onCommentsExpanded);
  });
}

function onCommentsExpanded() {
  var sender = $(this);
  var post = ko.dataFor(sender[0]);
  loadComments(post);
}

function loadComments(post) {
  if (!post.commentsLoading()) {
    post.commentsLoading(true);
    $.ajax({
      url: '/api/timeline/posts/' + post.id + '/comments',
      dataType: "json",
      //ifModified: true,
      //success: comments_success,
      error: comments_error,
      success: function (data, status, jqXHR) {
        comments_success(data, status, jqXHR);
        onCommentsLoaded(post, data);
      },
      complete: comments_complete
      // error: function (jqXHR, status, error) {
      // }
    });
  }
}

function comments_success(data, status, jqXHR) {

}

function comments_error(jqXHR, status, error) {

}

function comments_complete(jqXHR, status) {

}

function onCommentsLoaded(post, data) {
  post.commentsLoading(false);
  // TODO: provide latest comment date/id in order for server returning only delta 
  post.comments.removeAll();
  if (data) {
    post.commentsCount(data.length);
    // turn comments into PostViewModel instances (as per current design)
    $(data).each(function(index, entry) {
      post.comments.push(new PostViewModel({
        id: entry.id,
        account: entry.account,
        name: entry.name,
        content: entry.content,
        created: entry.created,
        pictureSize: 32,
        pictureId: entry.pictureId
      }));
    });

    // TODO: temp
    enableAccountPopups();
    enableAccountTooltips();
  }
}

function doPostComment(form) {
  var formData = $(form).serialize();
  $.post('/api/timeline/comments', formData, function (result) {
    onCommentPosted(result);
  });
}

function onCommentPosted(data, status, response) {
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

  enableAccountPopups();
  enableAccountTooltips();

  post.sortComments();
  editor.val("");
}

// ========================================================================================
// Account image popovers
// ========================================================================================

var isPopupVisible = false;
var clickedAway = false;
var openedPopup;

function enableAccountPopups() {

  // rebind clickaway subscribers
  $(document)
    .unbind("click touchend", onAccountPopupClickedAway)
    .bind("click touchend", onAccountPopupClickedAway);

  //var elements = (!target)
  //  ? $("img[data-link-type='account']")
  //  : $(target).find("img[data-link-type='account']");

  var elements = $("img[data-link-type='account']");

  elements.each(function () {
    var img = $(this);

    var imgId = img.attr("id");
    img.popover({
      html: true,
      title: function () { return $("#" + imgId).attr("data-link-value"); },
      content: function () { return $(this).data("data-popover-data").html; },
      trigger: 'manual'
    }).unbind("click touchend", onAccountPopupClick)
      .bind("click touchend", onAccountPopupClick);
  });
}

function onAccountPopupClick(e) {
  e.preventDefault();
  var sender = $(this);
  var senderId = sender.attr("id");

  if (openedPopup !== senderId) {
    $("#" + openedPopup).popover("hide");

    sender.data("data-popover-data", {
      isLoading: false,
      html: "<div style='text-align:center;'><img src='/images/progress-loading.gif'/></div>"
    });

    sender.popover("show");
    openedPopup = senderId;
    isPopupVisible = true;

    var account = sender.attr("data-link-value");
    var profile = sender.data("data-popover-data");

    if (!profile.isLoading) {
      profile.isLoading = true;
      requestProfile(senderId, account, profile, onUserProfileFetched);
    }
  }

  clickedAway = false;
}

function requestProfile(senderId, account, profile, success) {
  $.ajax({
    url: '/accounts/' + account + '/profile',
    contentType: 'application/html; charset=utf-8',
    dataType: 'html',
    success: function (data) { success(senderId, data, profile); }
  });
}

function onUserProfileFetched(senderId, data, profile) {
  profile.isLoading = false;
  profile.html = data;

  // this is async invoke so we need to ensure that this particular popup is still opened
  if (openedPopup === senderId) {
    $('#' + senderId).popover('show'); // rebind opened view
  }
}

function onAccountPopupClickedAway() {
  if (isPopupVisible && clickedAway) {
    if (openedPopup) {
      $("#" + openedPopup).popover('hide');
      openedPopup = null;
    }
    isPopupVisible = clickedAway = false;
  }
  else {
    clickedAway = true;
  }
}

// ========================================================================================
// Smooth/infinite loading
// ========================================================================================

var _page = 0;
var _inCallback = false;

function initLazyLoading(url, onSuccess) {
  $(window).scroll(function () {
    if ($(window).scrollTop() === $(document).height() - $(window).height()) {
      if (_page > -1 && !_inCallback) {
        _inCallback = true;
        _page++;
        
        $("#page-data-loading").show();
        $("#content-loading-error").hide();

        $.ajax({
          type: "GET",
          dataType: "json",
          url: url(_page),
          timeout: 5000,
          success: function (data, textStatus) {
            // check whether any posts are loaded
            if (data.length > 0) {
              if (onSuccess && (typeof onSuccess == "function")) {
                onSuccess(data);
              }
            }
            else {
              // otherwise stop further attempts loading data as we reached the end
              _page = -1;
            }
          },
          error: function (request, status, error) {
            $("#content-loading-error").text("Error getting data. There seems to be a server problem, please try again later.");
            $("#content-loading-error").show();
            _page--;
          },
          complete: function (request, status) {
            _inCallback = false;
            $("#page-data-loading").hide();
          }
        });
      }
    }
  });
}