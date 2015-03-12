'use strict';
/*jshint browser: true */
var HubClient = require('./HubClient');
var apiRequest = require('./api-request');
var jsonParser = require('./json-parser');

var connectionCache = require('./connection-cache');
var imageApiUrl = process.env.ASSET_STORE + '/api/images';
var removeUnusedImagesUrl = process.env.ASSET_STORE + '/api/remove-unused-images';

module.exports = {
	create: function(file, callback) {
        var data = new FormData();
        data.append('image', file);
        data.append('filename', file.name);
        data.append('token', connectionCache.getToken());
        
        var xhr = apiRequest.makeRequest({
        	url: imageApiUrl,
        	responseParser: jsonParser,
        	method: 'POST',
        	formData: data,
        	onLoad: function(data) {
                var tags = data.tags ? data.tags.join(', ') : '';
                
				var status = (tags === '' ? 'warning' : 'success');

                callback(status, {
                    url: data.url, 
                    tags: tags
                });    
	        },
	        onError: function() {
	        	callback('danger');	
	        }
        });

  
    },
	removeUnusedImages: function(callback) {
		var data = new FormData();
		data.append('token', connectionCache.getToken());

		var xhr = apiRequest.makeRequest({
			url: removeUnusedImagesUrl,
			method: 'POST',
			formData: data,
			onLoad: callback,
		});
	}
};
