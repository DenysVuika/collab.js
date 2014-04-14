angular.module('collabjs.directives')
  .directive('textLimit', ['$timeout',
    function ($timeout) {
      'use strict';
      return {
        restrict: 'A',
        scope: {
          counter: '@'
        },
        link: function (scope, element, attrs) {

          function init() {
            var $element = $(element);
            var $submit = $element.parents('form').find('button[type="submit"]');
            var $counter = $('#' + scope.counter);

            $(element).countdown({
              limit: parseInt(attrs.textLimit),
              init: function (counter) {
                $counter.css('color', '#999').text(counter);
              },
              plus: function (counter) {
                $counter.css('color', '#999').text(counter);
                $submit.removeAttr('disabled');
              },
              minus: function (counter) {
                $counter.css('color', 'red').text(counter);
                $submit.attr('disabled', 'disabled');
              }
            });
          }

          $timeout(init, 0);
        }
      };
    }]);