/*jshint browser: true */
'use strict';

var API_URL = 'http://api.soundcloud.com/';
var objectAssign = require('object-assign');
var apiRequest = require('./api-request');
var jsonParser = require('./json-parser');
var _ = require('lodash');

if (! process.env.SOUNDCLOUD_CLIENT_ID) {
	throw 'SoundCloud client id is required, please set it in environment variables';
}

var resolveCache = {};

var resolveAttribute = function(soundCloudUrl, attr, callback) {
	if (resolveCache.hasOwnProperty(soundCloudUrl)) {
		callback(resolveCache[soundCloudUrl][attr]);
	} else {
		var query = {
			client_id: process.env.SOUNDCLOUD_CLIENT_ID, 
			url: soundCloudUrl
		};
		
		apiRequest.makeRequest({
			url: API_URL + 'resolve.json',
			responseParser: jsonParser,
			query: query,
			onLoad: function(data) {
				resolveCache[soundCloudUrl] = data;
				callback(data[attr]);
			}
		});
	}
};

module.exports = {
	waveformUrl: function(soundCloudUrl, callback) {
		resolveAttribute(soundCloudUrl, 'waveform_url', callback);
	},
	streamUrl: function(soundCloudUrl, callback) {
		resolveAttribute(soundCloudUrl, 'stream_url', function(url) {
			callback(url + '?' + apiRequest.urlParams({client_id: process.env.SOUNDCLOUD_CLIENT_ID}));
		});
	}

};

