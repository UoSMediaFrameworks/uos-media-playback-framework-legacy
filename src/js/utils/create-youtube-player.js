'use strict';
/*global YT: false, window: false */

var requireSDK = require('require-sdk');

function createYoutubePlayer(id, cb) {
	var sdk = loadApi();

	return sdk(function(err) {
		var player = new YT.Player(id, {
			playerVars: {
				controls: 0,
				modestbranding: 1,
				showinfo: 0,
				disablekb: 1,
				wmode: 'window'
			}
		});
		return cb(player);
	});
}

function loadApi () {
	var sdk = requireSDK('https://www.youtube.com/iframe_api', 'YT');
	var loadTrigger = sdk.trigger();

	window.onYouTubeIframeAPIReady = function() {
		loadTrigger();
		delete window.onYouTubeIframeAPIReady;
	};

	return sdk;
}

module.exports = createYoutubePlayer;