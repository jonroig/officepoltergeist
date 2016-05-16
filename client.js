// this runs in the background of the browser...
var hauntController = hauntController || {};

hauntController.url = "http://127.0.0.1:3000"; //io("https://officepoltergeist.net");
var socket = io.connect(hauntController.url);


// this is  model view poltergeist controller
socket.on('hauntcontrol', function(msg){
	console.log('hauntcontrol',msg);
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
			hauntController.speak(msg.resource);
			break;
		case 'keyEffect' :
			hauntController.keyEffect(msg.resource);
			break;
		case 'status' :
			//return the status
			break;
		case 'scrollEffect' :
			hauntController.scrollEffect(msg.resource);
			break;
		default:
			// don't do anything
		}
});


// connect handler
socket.on('connect', function(){
	console.log('connected');
	hauntController.joinChannel();
	if (hauntController.poltergeistStatus == false) {
		socket.disconnect();
	}
});


// disconnect handler
socket.on('disconnect', function(){
	console.log('disconnected');
});


// HAUNT CONTROLS

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


// this is the home of the fartscroll, maybe more stuff later
hauntController.scrollEffect = function(resource) {
	if (resource == undefined) {
		chrome.storage.local.remove('scrollEffectsArray');
	}

	hauntController.addToEffectArray('scrollEffectsArray', resource);
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
		hauntController.joinChannel();
	});
}


// generate a guid... got this code from: http://stackoverflow.com/a/105074/1861347
hauntController.generateGuid = function(){
	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
			}
		return s4() + '-' + s4() + '-' + s4() + '-' + s4();
	}
	hauntController.poltergeistId =  guid();
	chrome.storage.local.set({poltergeistId: hauntController.poltergeistId});
	return guid();
}


// shall we join a channel? (we shall.)
hauntController.joinChannel = function(){
	if (hauntController.poltergeistId === null) {
		return false;
	}
	var channel = hauntController.poltergeistId;
	socket.emit('joinChannel', channel );
}


// handle the poltergeistId naming...
hauntController.poltergeistId = null;
chrome.storage.local.get('poltergeistId', function (results) {
	if (_.isEmpty(results)) {
		//hauntController.getNewName();
		hauntController.generateGuid();
	} else {
		hauntController.poltergeistId = results.poltergeistId;
	}

	console.log('poltergeistId=',hauntController.poltergeistId);
});


// handle the on / off state... on by default
hauntController.poltergeistStatus = null;
hauntController.updatePoltergeistStatus = function() {
	chrome.storage.local.get('poltergeistStatus', function (results) {
		if (_.isEmpty(results)) {
			hauntController.poltergeistStatus = true;
			chrome.storage.local.set({poltergeistStatus: true});
			return;
		}

		if (results.poltergeistStatus == true) {
			socket.connect(hauntController.url,{'forceNew':true });
			hauntController.poltergeistStatus = true;
		} else {
			hauntController.poltergeistStatus = false;
			socket.disconnect();
		}
	});
}

hauntController.updatePoltergeistStatus();


// watch for changes in the local storage so we can turn the status on and off...
chrome.storage.onChanged.addListener(function(changes, namespace) {
	if (changes['poltergeistStatus']) {
		hauntController.updatePoltergeistStatus();
	}
});


// send out the status to the channel...
var poltergeistStatusUpdateInterval = setInterval(function(){
	if (!hauntController.poltergeistStatus && hauntController.poltergeistId){
		return;
	}

	chrome.storage.local.get(null, function(results){
		socket.emit('statusUpdate', results );
	});

}, 10000);





