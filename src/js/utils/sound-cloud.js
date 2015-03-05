/* global SC: false */
'use strict';

if (! process.env.SOUNDCLOUD_CLIENT_ID) {
	throw 'SoundCloud client id is required, please set it in environment variables';
}

SC.initialize({
    client_id: process.env.SOUNDCLOUD_CLIENT_ID
});


var infoCache = {};

module.exports = {
	getInfo: function(soundCloudUrl, callback) {
		if (infoCache.hasOwnProperty(soundCloudUrl)) {
			callback(infoCache[soundCloudUrl]);
		}

		SC.get('/resolve?url=' + soundCloudUrl, function(data) {
			infoCache[soundCloudUrl] = data;
			callback(data);
		});
	}
};

