'use strict';
/*jshint browser: true */
var HubClient = require('./HubClient');
var apiRequest = require('./api-request');
var jsonParser = require('./json-parser');

var connectionCache = require('./connection-cache');
var assetUploadApi = process.env.ASSET_STORE + '/api/';
var removeUnusedImagesUrl = process.env.ASSET_STORE + '/api/remove-unused-images';

var imageFileTypes = ["png", "jpg","tiff","webp","gif","svg"];
var videoFileTypes = ["mov", 'mp4',"webm","flv","wmv","avi","ogg","qt","asf","mpg","3gp"];

//APEP Improve - this default image case is not good practice
function getMediaObjectType(file) {

    var fileExtension = file.name.split('.').pop();

    var mediaType = "image";
    if(imageFileTypes.indexOf(fileExtension) != -1) {
        mediaType = "image";
    } else if (videoFileTypes.indexOf(fileExtension) != -1) {
        mediaType = "video";
    }

    return mediaType
}


module.exports = {
	create: function(file, callback) {
        //APEP improve handle getFileType - handle cases that are not matched - currently assumed everything is an image
        var mediaType = getMediaObjectType(file);
        var apiUrl = assetUploadApi + mediaType + 's';

        var data = new FormData();
        data.append(mediaType, file);
        data.append('filename', file.name);
        data.append('token', connectionCache.getToken());
        var xhr = apiRequest.makeRequest({
        	url: apiUrl,
        	responseParser: jsonParser,
        	method: 'POST',
        	formData: data,
        	onLoad: function(err,data) {
                var tags = data.tags ? data.tags.join(', ') : '';

				var status = (tags === '' ? 'warning' : 'success');
                callback(status, {
                    url: data.url,
                    tags: tags,
                    type: mediaType
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
