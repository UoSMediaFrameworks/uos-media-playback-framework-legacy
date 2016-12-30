'use strict';
/*jshint browser: true */
var HubClient = require('./HubClient');
var apiRequest = require('./api-request');
var jsonParser = require('./json-parser');
var connectionCache = require('./connection-cache');
var IMAGE_FILE_TYPES = require('./allowed-upload-file-extensions').IMAGE_FILE_TYPES;
var VIDEO_FILE_TYPES = require('./allowed-upload-file-extensions').VIDEO_FILE_TYPES;


var assetUploadApi = process.env.ASSET_STORE + '/api/';
var removeUnusedImagesUrl = process.env.ASSET_STORE + '/api/remove-unused-images';
var resumableFinalAssetUploadApi = assetUploadApi + "resumable/final";

function getMediaObjectType(file) {

    var fileExtension = file.name.split('.').pop();

    var mediaType = "unsupported";
    if(IMAGE_FILE_TYPES.indexOf(fileExtension) != -1) {
        mediaType = "image";
    } else if (VIDEO_FILE_TYPES.indexOf(fileExtension) != -1) {
        mediaType = "video";
    }

    return {mediaType:mediaType,extension:fileExtension};
}


module.exports = {

    resumableCreate: function(file, resumableFile, callback) {

        var mediaObject = getMediaObjectType(file);
        if(mediaObject.mediaType === "unsupported") {
            console.log("The file type " + mediaObject.extension + " you have attempted to upload");
            return callback("unsupported", null);
        }

        var data = new FormData();
        data.append('filename', file.name);
        data.append('token', connectionCache.getToken());
        data.append('relativePath', resumableFile.relativePath);
        data.append('numberOfChunks', resumableFile.chunks.length);

        var xhr = apiRequest.makeRequest({
            url: resumableFinalAssetUploadApi,
            responseParser: jsonParser,
            method: 'POST',
            formData: data,
            onLoad: function(err,data) {
                var tags = data.tags ? data.tags.join(', ') : '';

                var status = (tags === '' ? 'warning' : 'success');
                callback(status, {
                    url: data.url,
                    tags: tags,
                    type: mediaObject.mediaType
                });
            },
            onError: function() {
                callback('danger', null);
            }
        });
    },

	create: function(file, callback) {
        var mediaObject = getMediaObjectType(file);
        if(mediaObject.mediaType === "unsupported"){
            console.log("The file type "+mediaObject.extension+" you have attempted to upload");
            return callback("unsupported", null);
        }
        var apiUrl = assetUploadApi + mediaObject.mediaType + 's';
        var data = new FormData();
        data.append(mediaObject.mediaType, file);
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
                    type: mediaObject.mediaType
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
			onLoad: callback
		});
	}
};
