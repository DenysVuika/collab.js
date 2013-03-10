$(document).ready(function() {
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