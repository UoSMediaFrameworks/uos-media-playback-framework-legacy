'use strict';

var makeRequest = require('./api-request').makeRequest;
var jsonParser = require('./json-parser');

var API_URL = 'https://api.vimeo.com/';

// so, this could be a security issue...because anyone can read the access token from the source.
// however, if the access token set doesn't have any priviliges, then what's the harm?
if (! process.env.VIMEO_ACCESS_TOKEN) {
	throw 'VIMEO_ACCESS_TOKEN must be set in environment variables';
}

var cache = {};

module.exports = {
	// callback in node style
	video: function(vimeoId, callback) {
		if ( cache.hasOwnProperty(vimeoId)) {
			callback(null, cache[vimeoId]);
		} else {
			makeRequest({
				url: API_URL + 'videos/' + vimeoId + '?fields=tags',
				responseParser: jsonParser,
				onLoad: function(err,data) {
                    if(err){
                        callback(err,null);
                    }else{
                        cache[vimeoId] = data;
                        callback(null, data);
                    }

				},
				headers: {
					'Authorization': 'bearer ' + process.env.VIMEO_ACCESS_TOKEN
				}
			});
		}
	}
};
