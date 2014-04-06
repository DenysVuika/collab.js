/*
  Card Layout based on Wookmark
  example:
  <div style="position:relative" ng-card-layout ng-items="posts">
    <ul>
      <li>...</li>
      ...
      <li>...</li>
    </ul>
  </div>
*/
angular.module('collabjs.directives')
  .directive('ngCardLayout', ['$timeout',
    function ($timeout) {
      'use strict';
      return {
        restrict: 'A',
        scope: {
          ngItems: '='
        },
        link: function (scope, element) {
          var layout;
          var layoutOptions = {
            autoResize: true,       // This will auto-update the layout when the browser window is resized.
            //direction: 'right',
            container: element,     // Optional, used for some extra CSS styling
            offset: 15,             // Optional, the distance between grid items
            outerOffset: 10//,        // Optional, the distance to the containers border
            //itemWidth: 450          // Optional, the width of a grid item
          };

          function onThumbnailClick(e) {
            e.preventDefault();
            var $target = $(e.target);
            if ($target.hasClass('youtube-play-button')) {
              $target = $target.siblings('.youtube-thumbnail');
            }
            var $container = $target.parents('.youtube-container');
            var videoId = $target.data('video-id');
            if (videoId) {
              var frame = $('<iframe/>');
              frame.attr('src', 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&wmode=opaque&enablejsapi=1');
              frame.addClass('youtube-video');
              frame.width($target.width());
              frame.height($target.height());
              $container.empty().append(frame);
            }
          }

          function performLayout() {
            if (layout && layout.wookmarkInstance) {
              layout.wookmarkInstance.clear();
            }

            $(element.find('img.youtube-thumbnail')).imagesLoaded(function () {
              layout = element.find('> ul > li');
              layout.wookmark(layoutOptions);

              // wire YouTube thumbnails
              var thumbnails = $(element.find('.youtube-thumbnail'));
              thumbnails.unbind('click').bind('click', onThumbnailClick);

              // wire YouTube Play buttons
              var buttons = $(element.find('.youtube-play-button'));
              buttons.unbind('click').bind('click', onThumbnailClick);

            }).done(function(instance) {
              console.log('Loaded images: ' + instance.images.length);
            });
          }

          scope.$watchCollection('ngItems', function () {
            $timeout(performLayout, 0);
          });
        }
      };
    }
  ]);