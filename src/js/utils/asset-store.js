'use strict';
/*jshint browser: true */
var HubClient = require('./HubClient');
var jsonApiRequest = require('./json-api-request');

var imageApiUrl = process.env.ASSET_STORE + '/api/images';

module.exports = {
	create: function(file, callback) {
        var data = new FormData();
        data.append('image', file);
        data.append('filename', file.name);
        data.append('token', HubClient.getToken());
        
        var xhr = jsonApiRequest.makeRequest({
        	url: imageApiUrl,
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
	delete: function(url, callback) {
		var xhr = jsonApiRequest.makeRequest({
			url: imageApiUrl,
			method: 'DELETE',
			query: {url: url},
			onLoad: callback,
		});
	}
};
