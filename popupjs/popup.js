
document.addEventListener("DOMContentLoaded", function(event) {

	// populate the poltergeist id
	chrome.storage.local.get('poltergeistId', function (results) {
		document.getElementById('poltergeistId').innerHTML = results.poltergeistId;
	});

	// turn on or off the on off switch
	chrome.storage.local.get('poltergeistStatus', function (results) {
		if (results.poltergeistStatus == true) {
			$('#poltergeistOnOffSwitch').prop('checked', true);
		} else {
			$('#poltergeistOnOffSwitch').prop('checked', false);
		}
	});

	$('.onoffswitch-label').click(function(){
		var checkedSwitch = !$('#poltergeistOnOffSwitch').prop('checked');
		$('#poltergeistOnOffSwitch').prop('checked', checkedSwitch);
		chrome.storage.local.set({poltergeistStatus: checkedSwitch});
	});

	$('#ghostattack').click(function(){
		window.open("https://officepoltergeist.net", "_blank");
	});

	$('#poltergeistTitle').click(function(){
		window.open("https://officepoltergeist.net", "_blank");
	});

});

