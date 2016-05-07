// this is the thing that runs everytime a page loads...
var officePoltergeist = officePoltergeist || {};

officePoltergeist.localBrowserEffectsObj = {};



// this is where we look at all the search and replace terms...
officePoltergeist.searchAndReplaceArray = [];
officePoltergeist.runSearches = function() {
	// undo any previous searches
	_.each(officePoltergeist.searchAndReplaceArray, function(findObj) {
		findObj.revert();
	})
	officePoltergeist.searchAndReplaceArray = [];

	// re-do the new searchs
	chrome.storage.local.get('searchArray', function (results) {
		console.log('searchArray', results.searchArray);
		_.each(results.searchArray, function(searchObj){

			if (searchObj != null) {
				var finder = findAndReplaceDOMText(document, {
					find: searchObj.from,
				  	replace: function(portion, match) {
				  		return searchObj.to;
				  	}
				});

				// store each one so we can rever the search later
			  	officePoltergeist.searchAndReplaceArray.push(finder);
			}
		});
	});
}


// this is where we handle the application of all css-related effects...
officePoltergeist.applyCssEffects = function() {
	webkitFilterArray = [];
	chrome.storage.local.get('cssEffectsArray', function (results) {
		_.each(results.cssEffectsArray, function(cssEffectObj){
			if (cssEffectObj != null) {
				switch (cssEffectObj.effect) {
					case 'blur':
						webkitFilterArray.push({target: cssEffectObj.target, cssEffect: " blur(" + cssEffectObj.value + "px)" })
						break;
					case 'rotate':
						$(cssEffectObj.target).css("transform", "rotate(" + cssEffectObj.value + "deg)");
						break;
					case 'grayscale':
						var grayscaleValue = Math.round(cssEffectObj.value) * .1 ;
						webkitFilterArray.push({ target: cssEffectObj.target, cssEffect: " grayscale(" + grayscaleValue+ ")" });
						break;
					case 'sepia':
						var sepiaValue = Math.round(cssEffectObj.value) * .1 ;
						webkitFilterArray.push({ target: cssEffectObj.target, cssEffect: " sepia(" + sepiaValue+ ")" });
						break;
					case 'brightness':
						webkitFilterArray.push({ target: cssEffectObj.target, cssEffect: " brightness(" + cssEffectObj.value+ ")" });
						break;
					case 'contrast':
						webkitFilterArray.push({ target: cssEffectObj.target, cssEffect: " contrast(" + cssEffectObj.value+ ")" });
						break;
					case 'huerotate':
						webkitFilterArray.push({ target: cssEffectObj.target, cssEffect: " hue-rotate(" + cssEffectObj.value + "deg)" });
						break;
					case 'invert':
						var invertValue = Math.round(cssEffectObj.value) * .1 ;
						webkitFilterArray.push({ target: cssEffectObj.target, cssEffect: " invert(" + invertValue+ ")" });
						break;
					case 'saturate':
						webkitFilterArray.push({ target: cssEffectObj.target, cssEffect: " saturate(" + cssEffectObj.value + ")" });
						break;
					case 'opacity':
						var opacityValue = Math.round(cssEffectObj.value) * .1 ;
						webkitFilterArray.push({ target: cssEffectObj.target, cssEffect: " opacity(" + opacityValue+ ")" });
						break;
					default:
						// don't do anything
						break;
				}
			}
		});

		// here we merge all the webkit filters at once...
		if (!_.isEmpty(webkitFilterArray)) {

			var outputObjArray = {};
			_.each(webkitFilterArray, function(webkitFilterItem) {
				if (outputObjArray[webkitFilterItem.target]) {
					outputObjArray[webkitFilterItem.target] += webkitFilterItem.cssEffect;
				} else {
					outputObjArray[webkitFilterItem.target] = webkitFilterItem.cssEffect;
				}
			});

			_.each(outputObjArray, function(value, key) {
				$(key).css('-webkit-filter', value);
			});
		}
	});

}

// http://www.youtube.com/v/oHg5SJYRHA0?version=3
officePoltergeist.applyPageEffects = function() {
	_.each(officePoltergeist.localBrowserEffectsObj['pageEffectsArray'], function(pageEffectObj){
		if (pageEffectObj.activated == "true") {
			switch (pageEffectObj.effect) {
				case 'rickroll':

					// attack the iframe... change it to what we want...
					var iframes = $('iframe');
					_.each(iframes, function(iframeObj) {
						var iframeTarget = $(iframeObj);
						if (iframeTarget.attr('src')) {
							if (iframeTarget.attr('src').indexOf('youtube') > -1 && iframeTarget.attr('src') != 'https://www.youtube.com/embed/oHg5SJYRHA0') {
								iframeTarget.attr('src', 'https://www.youtube.com/embed/oHg5SJYRHA0');
							}
						}
					});

					break;
				default:
					// don't do anything
			}
		}
	});
}



// everytime the local storage changes, apply the changes...
chrome.storage.onChanged.addListener(function(changes, namespace) {
	console.log('changes',changes);
	console.log('namespace',namespace);

	if (changes['cssEffectsArray']) {
		officePoltergeist.applyCssEffects();
	}
	if (changes['searchArray']) {
		officePoltergeist.runSearches();
	}
});

// set an interval to watch to switch youtube vidoes
setInterval(function(){
	officePoltergeist.applyPageEffects();
}, 250);


// this is the stuff we do on page load...
$(document).ready(function() {
  	officePoltergeist.applyCssEffects();
  	officePoltergeist.runSearches();
});

// any keyboard effects are handled in here...
$(document).on( "keydown", function(){
	chrome.storage.local.get('keyEffectsArray', function (results) {
		_.each(results.keyEffectsArray, function(keyEffectObj){
			if (keyEffectObj.activated == "true") {
				switch (keyEffectObj.effect) {
					case 'loudTyping' :
						var myAudio = new Audio();
						myAudio.src = chrome.extension.getURL("media/button_push.mp3");
						myAudio.play();
						break;
					default:
						break;
				}
			}
		});
	});
});
