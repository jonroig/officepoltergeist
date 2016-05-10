// populate the poltergeist id
document.addEventListener("DOMContentLoaded", function(event) {
	chrome.storage.local.get('poltergeistId', function (results) {
		document.getElementById('poltergeistId').innerHTML = results.poltergeistId;
	});
});