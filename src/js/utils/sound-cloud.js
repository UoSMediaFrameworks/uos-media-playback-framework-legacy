/*jshint browser: true */
'use strict';

var API_URL = 'http://api.soundcloud.com/';
var objectAssign = require('object-assign');
var _ = require('lodash');

if (! process.env.SOUNDCLOUD_CLIENT_ID) {
	throw 'SoundCloud client id is required, please set it in environment variables';
}


var urlParams = function(obj) {
	return _.map(obj, function(val, key) {
		return encodeURI(key) + '=' + encodeURI(val);
	}).join('&');
};

var makeRequest	= function (method, args, onLoad, onError) {
	var xhr = new XMLHttpRequest();

	var errorHandler = function(status) {
		if (onError) {
			onError(status);
		} else {
			throw 'sound cloud http request failed to "' + method + '"';
		}
	};

	xhr.onload = function() {
		if (xhr.status === 200) {
			onLoad(JSON.parse(xhr.responseText));	
		} else {
			errorHandler(xhr.status);
		}
		
	};

	xhr.onerror = function() {
		errorHandler(xhr.status);
	};

	var argsString = urlParams(objectAssign({client_id: process.env.SOUNDCLOUD_CLIENT_ID}, args));
	var url = API_URL + method + '.json?' + argsString;
	
	xhr.open('GET', url);
	xhr.send();
	return xhr;
};

var resolveCache = {};

var resolveAttribute = function(soundCloudUrl, attr, callback) {
	if (resolveCache.hasOwnProperty(soundCloudUrl)) {
		callback(resolveCache[soundCloudUrl][attr]);
	} else {
		makeRequest('resolve', {url: soundCloudUrl}, function(data) {
			resolveCache[soundCloudUrl] = data;
			callback(data[attr]);
		});
	}
};

module.exports = {
	waveformUrl: function(soundCloudUrl, callback) {
		resolveAttribute(soundCloudUrl, 'waveform_url', callback);
	},
	streamUrl: function(soundCloudUrl, callback) {
		resolveAttribute(soundCloudUrl, 'stream_url', function(url) {
			callback(url + '?' + urlParams({client_id: process.env.SOUNDCLOUD_CLIENT_ID}));
		});
	}

};

