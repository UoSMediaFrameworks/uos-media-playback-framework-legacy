'use strict';
/*jshint browser: true */
var HubClient = require('./HubClient');
var apiRequest = require('./api-request');
var jsonParser = require('./json-parser');
var connectionCache = require('./connection-cache');
var UploadFileExtensions = require('./allowed-upload-file-extensions');

var IMAGE_FILE_TYPES = UploadFileExtensions.IMAGE_FILE_TYPES;
var VIDEO_FILE_TYPES = UploadFileExtensions.VIDEO_FILE_TYPES;
var AUDIO_FILE_TYPES = UploadFileExtensions.AUDIO_FILE_TYPES;


var ASSET_UPLOAD_API = process.env.ASSET_STORE + '/api/';
var REMOVE_UNUSED_IMAGES_API = process.env.ASSET_STORE + '/api/remove-unused-images';
var RESUMABLE_FINAL_UPLOAD_API = ASSET_UPLOAD_API + "resumable/final";
var GET_FULL_SCENE_API = ASSET_UPLOAD_API + "scene/full";

function getMediaObjectType(file) {

    var fileExtension = file.name.split('.').pop();

    var mediaType = "unsupported";
    if(IMAGE_FILE_TYPES.indexOf(fileExtension) !== -1) {
        mediaType = "image";
    } else if (VIDEO_FILE_TYPES.indexOf(fileExtension) !== -1) {
        mediaType = "video";
    } else if (AUDIO_FILE_TYPES.indexOf(fileExtension) !== -1) {
        mediaType = "audio";
    }

    return {mediaType:mediaType,extension:fileExtension};
}


module.exports = {
    checkTranscodedStatus:function(videoMediaObject,callback){

        var apiUrl = ASSET_UPLOAD_API + "isTranscoded";
        var data = new FormData();
        data.append("token",connectionCache.getToken());
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
        console.log("GFS", sceneId, connectionCache.getToken() );
        var urlEncodedDataPairs = [];
        urlEncodedDataPairs.push(encodeURIComponent('sceneId') + '=' + encodeURIComponent(sceneId));
        urlEncodedDataPairs.push(encodeURIComponent('token') + '=' + encodeURIComponent(connectionCache.getToken()));
        var urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
        console.log("API REQ", urlEncodedData);
        var xhr = apiRequest.makeRequest({
            url: GET_FULL_SCENE_API,
            responseParser: jsonParser,
            method: 'POST',
            formData: urlEncodedData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },

            onLoad: function(err,data) {
                callback(err, data);
            },

            onError: function(err) {
                callback(err, null);
            }
        });
    },

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
        data.append('uniqueIdentifier', resumableFile.uniqueIdentifier);
        data.append('mediaType', mediaObject.mediaType);

        var xhr = apiRequest.makeRequest({
            url: RESUMABLE_FINAL_UPLOAD_API,
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

	removeUnusedImages: function(callback) {
		var data = new FormData();
		data.append('token', connectionCache.getToken());

		var xhr = apiRequest.makeRequest({
			url: REMOVE_UNUSED_IMAGES_API,
			method: 'POST',
			formData: data,
			onLoad: callback
		});
	}
};
