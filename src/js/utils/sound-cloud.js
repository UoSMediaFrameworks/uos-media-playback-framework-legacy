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

function identity (val) { return val; }

function apiHandler (attribute, transform) {
	var trans = transform || identity;

	return function(soundCloudUrl, callback) {
		resolveAttribute(soundCloudUrl, attribute, function(attributeValue) {
			callback(trans(attributeValue));	
		});
	};
}

var tagRegexp = /\s*?(?:"([^"]+)"|([^\s]+))\s*?/;

function convertTags (tagString) {
	// sound cloud has it's tags space seperated, and multi word tags
	// are enclosed in quotes
	// this is a quick little tokenizer/parser to make them match our 
	// comma seperated format
	var tags = [],
		match,
		matchString = tagString;
	
	while (matchString !== '') {
		match = tagRegexp.exec(matchString);

		if (! match) {
			tags.push(matchString.trim());
			break;
		} else {
			tags.push(match[1] || match[2]);
			// remove the match from the matchString
			matchString = matchString.substring(match[0].length);
		}
	}

	return tags.join(', ');
}

module.exports = {
	waveformUrl: apiHandler('waveform_url'),
	tags: apiHandler('tag_list', convertTags),
	streamUrl: apiHandler('stream_url', function(url) {
		return url + '?' + apiRequest.urlParams({client_id: process.env.SOUNDCLOUD_CLIENT_ID});
	}),
	convertTags: convertTags
};

