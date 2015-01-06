'use strict';
/*jshint browser: true */
var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var ActionTypes = SceneConstants.ActionTypes;
var _ = require('lodash');

var SceneActions = {
    updateScene: function(scene) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: scene
        });

        HubClient.save(scene);        
    },

    addMediaObject: function(scene, mediaType, url, tags) {
        scene.scene.push({
            mediaObject: {
                url: url,
                type: mediaType,
                tags: tags
            }
        });

        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: scene
        });

        HubClient.save(scene);
    },

    removeMediaObject: function(scene, mediaObjectId) {     
        scene.scene.splice(_.findIndex(scene.scene, function(obj) {
            return obj.mediaObject.id === mediaObjectId;
        }), 1);    
        
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: scene
        });

        HubClient.save(scene);
    },

    logout: function() {
        AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGOUT
        });
        HubClient.logout();

        location.reload();
    },

    uploadAsset: function(scene, file) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.UPLOAD_ASSET,
            file: file
        });

        function dispatchResult (success, msg) {
            AppDispatcher.handleServerAction({
                type: ActionTypes.UPLOAD_ASSET_RESULT,
                file: file,
                success: success,
                msg: msg
            });

            var msecs = success ? 1000 : 10000;
            
            setTimeout(function() {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.UPLOAD_ASSET_RESULT_REMOVE,
                    file: file
                });    
            }, msecs);
        }

        var data = new FormData();
        data.append('image', file);
        data.append('filename', file.name);
        data.append('token', HubClient.getToken());
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
                SceneActions.addMediaObject(scene, 'image', data.url, data.tags.join(', '));    
                dispatchResult(true);
            } else {
                dispatchResult(false, data.error);
            }
        };

        xhr.onerror = function() {
            dispatchResult(false);
        };

        xhr.open('POST', 'http://smaassetstore.azurewebsites.net/api/images');
        //xhr.open('POST', 'http://localhost:4000/api/images');
        xhr.send(data);
    }
};

module.exports = SceneActions;  