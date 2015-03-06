'use strict';

var makeRequest = require('./json-api-request').makeRequest;

var API_URL = 'https://api.vimeo.com/';

// so, this could be a security issue...because anyone can read the access token from the source.
// however, if the access token set doesn't have any priviliges, then what's the harm?
if (! process.env.VIMEO_ACCESS_TOKEN) {
	throw 'VIMEO_ACCESS_TOKEN must be set in environment variables';
}

module.exports = {
	// callback in node style
	video: function(vimeoId, callback) {
		makeRequest({
			url: API_URL + 'videos/' + vimeoId,
			onLoad: function(data) {
				callback(null, data);
			},
			onError: callback,
			headers: {
				'Authorization': 'bearer ' + process.env.VIMEO_ACCESS_TOKEN
			}
		});
	}
};