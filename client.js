// this runs in the background of the browser...

var socket = io("https://officepoltergeist.net");

// this is  model view poltergeist controller
socket.on('hauntcontrol', function(msg){
	console.log('msg',msg);

	switch (msg.action) {
		case 'sound' :
			hauntController.playSound(msg.resource);
			break;
		case 'replace' :
			hauntController.searchAndReplace(msg.resource);
			break;
		case 'pageEffect' :
			hauntController.pageEffect(msg.resource);
			break;
		case 'cssEffect' :
			hauntController.cssEffect(msg.resource);
			break;
		case 'speak' :
			hauntController.speak(msg.resource)
			break;
		case 'keyEffect' :
			hauntController.keyEffect(msg.resource)
			break;
		case 'status' :
			//return the status
			break;
		default:
			// don't do anything
		}
});


var hauntController = hauntController || {};


// play a sound
hauntController.soundArray = [];
hauntController.playSound = function(resource) {
	var myAudio = new Audio();
	myAudio.src = "media/" + resource;
	myAudio.play();
	soundArray.push(myAudio);
}


// speech...
hauntController.speak = function(resource) {
  chrome.tts.speak(
      	resource.text,
      	{
    		voiceName: resource.voice
    	}
    );
}


// page effects are things like youtube replacement
hauntController.pageEffect = function(resource) {
	if (resource == undefined) {
		chrome.storage.local.remove('pageEffectsArray');
	}

	hauntController.addToEffectArray('pageEffectsArray', resource);
}


// this keeps track of text search and replace
hauntController.searchAndReplace = function(resource) {
	if (resource == undefined) {
		chrome.storage.local.remove('searchArray');
	}

	hauntController.addToEffectArray('searchArray', resource);
}


// effects which happen when keys are pressed
hauntController.keyEffect = function(resource) {
	if (resource == undefined) {
		chrome.storage.local.remove('keyEffectsArray');
	}

	hauntController.addToEffectArray('keyEffectsArray', resource);
}


// css effects are things like blur, rotate, etc...
hauntController.cssEffect = function(resource) {
	if (resource == undefined) {
		chrome.storage.local.remove('cssEffectsArray');
	}

	hauntController.addToEffectArray('cssEffectsArray', resource);
}


// this just keeps track of all of the filters of a given type, keeping
// 'em organized, unique, and stored in local storage for the client to
// consume
hauntController.addToEffectArray = function(effectArray, resource) {
	chrome.storage.local.get(effectArray, function (results) {
		var filteredArray = _.reject(results[effectArray], function(effectObj){
			return effectObj == null || effectObj.effect == resource.effect;
		});

		filteredArray.push(resource);

		var saveObj = {};
		saveObj[effectArray] = filteredArray;

		chrome.storage.local.set(saveObj);
		return;
	});
}


// get a new poltergiest name from the poltergeist name server
hauntController.getNewName = function() {
	var request = $.ajax('https://officepoltergeist.net/getname');
	request.done(function(data) {
		hauntController.poltergeistId = data;
		chrome.storage.local.set({poltergeistId: data});
	});
}


// handle the poltergeistId naming...
hauntController.poltergeistId = null;
chrome.storage.local.get('poltergeistId', function (results) {
	if (_.isEmpty(results)) {
		hauntController.getNewName();
	} else {
		hauntController.poltergeistId = results.poltergeistId;
	}

	console.log('poltergeistId=',hauntController.poltergeistId);
});