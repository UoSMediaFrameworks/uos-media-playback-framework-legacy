'use strict';
/*jshint browser: true */
var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var getVimeoId = require('../utils/get-vimeo-id');
var objectAssign = require('object-assign');
var ActionTypes = SceneConstants.ActionTypes;
var _ = require('lodash');
var soundCloud = require('../utils/sound-cloud');

var SceneActions = {
    updateScene: function(scene) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: scene
        });

        HubClient.save(scene);        
    },

    addMediaObject: function(sceneId, mediaObject) {
        // add a default empty tags attribute incase someone isn't specifying it
        var obj = objectAssign({tags: ''}, mediaObject);

        AppDispatcher.handleViewAction({
            type: ActionTypes.ADD_MEDIA_OBJECT,
            sceneId: sceneId,
            mediaObject: obj
        });
    },

    addText: function(sceneId, text) {
        SceneActions.addMediaObject(sceneId, {
            tags: '',
            type: 'text',
            text: text
        });

        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_SUCCESS
        });
    },

    addVimeo: function(sceneId, vimeoUrl) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var actionType;
            if (xhr.status === 200) {
                var tags = _.map(JSON.parse(xhr.responseText), function(tag) { return tag.trim(); });
                SceneActions.addMediaObject(sceneId, {
                    type: 'video', 
                    url: vimeoUrl,
                    tags: tags.join(', ')
                });
                actionType = ActionTypes.ADD_MEDIA_SUCCESS;
            } else {
                actionType = ActionTypes.ADD_MEDIA_FAILED;
            }

            AppDispatcher.handleServerAction({
                type: actionType
            });
        };

        xhr.onerror = function() {
            console.log('tag request failed');
            AppDispatcher.handleServerAction({
                type: ActionTypes.ADD_MEDIA_FAILED
            });
        };

        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_ATTEMPT,
            value: vimeoUrl
        });
        
        var xhrUrl = process.env.MEDIA_HUB + '/api/vimeo-tags?token=' + 
            HubClient.getToken() + '&vimeoId=' + getVimeoId(vimeoUrl);
        xhr.open('GET', xhrUrl);
        xhr.send();
    },

    addSoundCloud: function(sceneId, soundCloudUrl) {
        // so far keep it easy
        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_ATTEMPT,
            value: soundCloudUrl
        });

        soundCloud.getInfo(soundCloudUrl, function(data) {
            
            AppDispatcher.handleServerAction({
                type: ActionTypes.ADD_MEDIA_SUCCESS
            });

            SceneActions.addMediaObject(sceneId, {
                type: 'audio',
                url: soundCloudUrl
            });

        });
    },

    removeMediaObject: function(scene, index) {     
        var copy = _.cloneDeep(scene);
        copy.scene.splice(index, 1);    
        
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: copy
        });

        HubClient.save(copy);
    },

    logout: function() {
        AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGOUT
        });
        HubClient.logout();

        location.reload();
    },

    uploadAsset: function(sceneId, file) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.UPLOAD_ASSET,
            file: file
        });

        function dispatchResult (status, msg) {
            AppDispatcher.handleServerAction({
                type: ActionTypes.UPLOAD_ASSET_RESULT,
                file: file,
                status: status,
                msg: msg
            });

            var msecs = status === 'success' ? 1000 : 10000;
            
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
                var tags = data.tags ? data.tags.join(', ') : '';
                
                SceneActions.addMediaObject(sceneId, {
                    type: 'image', 
                    url: data.url, 
                    tags: tags
                });    

                if (tags === '') {
                    dispatchResult('warning', 'No tags found');
                } else {
                    dispatchResult('success');
                }
            } else {
                dispatchResult('danger', data.error);
            }
        };

        xhr.onerror = function() {
            dispatchResult('danger');
        };

        // envify replaces the process.env.NODE_ENV with the actual value
        // at time when gulp runs.  This will have to be refactored when
        // we deploy multiple instances accessing different asset stores
        var assetStoreUrl = process.env.ASSET_STORE;
        xhr.open('POST', assetStoreUrl + '/api/images');
        xhr.send(data);
    }
};

module.exports = SceneActions;  