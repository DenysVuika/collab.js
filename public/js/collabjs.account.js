$(document).ready(function() {
	if (!window.FileReader)
		$('#browserWarning').css('display', '')
	
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

function preview(input) {
	if (!!window.FileReader && input.files && input.files[0]) {
		$('#previewer').css('display', 'inline');
		var reader = new window.FileReader();
		reader.onload = function (e) {
			$('#previewer')
				.attr('src', e.target.result)
				.width(128)
				.height(128);
		};

		reader.readAsDataURL(input.files[0]);
	}
}