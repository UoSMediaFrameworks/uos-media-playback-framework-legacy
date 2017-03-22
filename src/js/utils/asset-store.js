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
var getFullSceneUrl = assetUploadApi + "scene/full";

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
    checkTranscodedStatus:function(videoMediaObject,callback){

        var apiUrl = assetUploadApi + "isTranscoded";
        var data = new FormData();
        data.append("token",connectionCache.getToken())
        data.append("url",videoMediaObject.url);
        data.append("parentId",videoMediaObject._id);
        var xhr = apiRequest.makeRequest({
            url:apiUrl,
            responseParser:jsonParser,
            method:"POST",
            formData:data,
            onLoad:function(err,data){
                callback(null,data)
            },
            onError:function(info){
              callback({error:info})
            }
        })
    },
    getFullScene: function(sceneId, callback) {
        var data = new FormData();
        data.append('sceneId', sceneId);
        data.append('token', connectionCache.getToken());

        var xhr = apiRequest.makeRequest({
            url: getFullSceneUrl,
            responseParser: jsonParser,
            method: 'POST',
            formData: data,
            onLoad: function(err,data) {
                console.log(data)
                callback(err, data);
            },
            onError: function(err) {
                callback(err, null);
            }
        });
    },

    resumableCreate: function(file, resumableFile, callback) {

        var mediaObject = getMediaObjectType(file);
        if(mediaObject.mediaType.toUpperCase() == mediaObject.mediaType) {
            console.log("The file type " + mediaObject.extension + " has an unexpected uppercase extension");
            return callback("uppercase", null);
        }
        if(mediaObject.mediaType === "unsupported") {
            console.log("The file type " + mediaObject.extension + " you have attempted to upload");
            return callback("unsupported", null);
        }


        var data = new FormData();
        data.append('filename', file.name);
        data.append('token', connectionCache.getToken());
        data.append('relativePath', resumableFile.relativePath);
        data.append('numberOfChunks', resumableFile.chunks.length);
        data.append('uniqueIdentifier', resumableFile.uniqueIdentifier);
        data.append('mediaType', mediaObject.mediaType);

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
