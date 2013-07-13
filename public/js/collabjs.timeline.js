/// <reference path="jquery.min.js" />
/// <reference path="knockout.js" />
/// <reference path="collabjs.js" />

$(document).ready(function () {
  $.get('/api/timeline/posts', function (data) {
      if (data && data.length > 0) {
        onFeedDataLoaded(data, collabjs.currentUser.account);
      } else {
        onFeedDataLoaded([], collabjs.currentUser.account);
      }
    });
    initLazyLoading(getDataUrl, onFeedDataLoaded);
    checkNewPosts();
  });

function doUpdateStatus()
{
  var data = $('#frmUpdateStatus').serialize();
  $('#frmUpdateStatus :input').attr('disabled', true);
  $.post('/api/timeline/posts', data, function (result) {
      $('#frmUpdateStatus :input').removeAttr('disabled');
      $('#new-post-dialog-inline').val('');
      $(document).trigger("collabjs.onStatusUpdated", result);
    });
}

// smooth infinite scrolling
// (downloads additional posts as soon as user scrolls to the bottom)
function getDataUrl() {
  var bottomPostId = Math.min.apply(this, $.map(window.timelineFeed.posts(), function (p) {
    return p.id;
  }));
  return '/api/timeline/posts?topId=' + bottomPostId;
}

// update polling
var updateChecker;

function checkNewPosts() {
  clearTimeout(updateChecker);
  updateChecker = setTimeout(function() {
    var topId = Math.max.apply(this, $.map(window.timelineFeed.posts(), function(o) { return o.id; }));
    $.get('/api/timeline/updates/count?topId=' + topId, function(data) {
      if (data && data.posts && data.posts > 0) {
        $("#new-msg-counter").text(data.posts);
        $("#msg-new-posts").show();
      }
      else {
        $("#msg-new-posts").hide();
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

function onUpdatesLoaded(data) {
  if (data && window.timelineFeed) {
    $(data).each(function(index, post) {
      window.timelineFeed.addNewPost(post);
    });
    // TODO: temp
    enableCommentExpanders();
  }
}