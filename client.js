// this runs in the background of the browser...
var hauntController = hauntController || {};

//var socket = io("https://officepoltergeist.net");
var socket = io("http://127.0.0.1:3000");

socket.on('announcement', function(announcement){
	console.log('announcement', announcement);
});

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
			hauntController.speak(msg.resource);
			break;
		case 'keyEffect' :
			hauntController.keyEffect(msg.resource);
			break;
		case 'status' :
			//return the status
			break;
		case 'scrollEffect' :
			hauntController.scrollEffect(resource);
			break;
		default:
			// don't do anything
		}
});


// on connect handler
socket.on('connect', function(){
	console.log('connected');
	hauntController.joinChannel();
	if (hauntController.poltergeistStatus == false) {
		hauntController.disconnect();
	}
});

hauntController.disconnect = function() {
	console.log('socket.disconnect();');
	socket.disconnect();
}


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


// shall we join a channel?
hauntController.joinChannel = function(){
	console.log('hauntController.poltergeistId ',hauntController.poltergeistId );
	if (hauntController.poltergeistId === null) {
		return false;
	}
	var channel = hauntController.poltergeistId; // .replace(' ', '_').toLowerCase();
	console.log('joining ' + channel);
	socket.emit('joinChannel', channel );
	socket.emit('joinChannel', 'announcements' );
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
chrome.storage.local.get('poltergeistStatus', function (results) {
	if (_.isEmpty(results)) {
		hauntController.poltergeistStatus = true;
		chrome.storage.local.set({poltergeistStatus: true});
		return;
	}

	if (results.poltergeistStatus == true) {
		hauntController.poltergeistStatus = true;
	} else {
		hauntController.poltergeistStatus = false;
	}
});

// send out the status to the channel...
var poltergeistStatusUpdateInterval = setInterval(function(){
	console.log('hauntController.poltergeistStatus', hauntController.poltergeistStatus);
	if (!hauntController.poltergeistStatus && hauntController.poltergeistId){
		return;
	}

	chrome.storage.local.get(null, function(results){
		console.log('results', results);
		socket.emit('statusUpdate', results );
	});

}, 10000);

// watch for changes in the local storage... primarily, we're just watching
// for changes in the poltergeistStatus so we can turn the connection
// on and off
chrome.storage.onChanged.addListener(function(changes, namespace) {
	if (changes['poltergeistStatus'])
		if (changes['poltergeistStatus'].newValue == true) {
			socket.io.connect();
		} else {
			socket.io.disconnect();
		}
	});