'use strict';
/*jshint browser: true */
var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var getVimeoId = require('../utils/get-vimeo-id');
var objectAssign = require('object-assign');
var ActionTypes = SceneConstants.ActionTypes;
var hat = require('hat');
var _ = require('lodash');
var soundCloud = require('../utils/sound-cloud');
var vimeoApi = require('../utils/vimeo-api');
var assetStore = require('../utils/asset-store');

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
            text: text,
            style: {
                'z-index': '1'
            }
        });

        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_SUCCESS
        });
    },

    addVimeo: function(sceneId, vimeoUrl) {

        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_ATTEMPT,
            value: vimeoUrl
        });

        vimeoApi.video(getVimeoId(vimeoUrl), function(err, data) {
            if (err) {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.ADD_MEDIA_FAILED
                });
            } else {
                var tags = _(data.tags).pluck('tag').map(function(x) { return x.trim(); }).value().join(', ');
                SceneActions.addMediaObject(sceneId, {
                    type: 'video',
                    volume: 100,
                    url: vimeoUrl,
                    tags: tags,
                    style: {
                        'z-index': '1'
                    }
                });

                AppDispatcher.handleServerAction({
                    type: ActionTypes.ADD_MEDIA_SUCCESS
                });
            }
        });
    },

    addSoundCloud: function(sceneId, soundCloudUrl) {
        // so far keep it easy
        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_ATTEMPT,
            value: soundCloudUrl
        });


        soundCloud.tags(soundCloudUrl, function(tags) {
            AppDispatcher.handleServerAction({
                type: ActionTypes.ADD_MEDIA_SUCCESS
            });

            SceneActions.addMediaObject(sceneId, {
                type: 'audio',
                volume: 100,
                url: soundCloudUrl,
                tags: tags,
                style: {
                    'z-index': '1'
                }
            });
        });
    },

    removeMediaObject: function(scene, index) {
        var copy = _.cloneDeep(scene);
        var removedObject = copy.scene.splice(index, 1);
        if (removedObject.length === 0) {
            throw "attempted to remove mediaObject not found in scene";
        }

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

    dismissStatus: function(alertId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.STATUS_MESSAGE_REMOVE,
            message: alertId,
            id: alertId
        });
    },

    uploadAsset: function(sceneId, file) {
        var alertId = hat();
        AppDispatcher.handleViewAction({
            type: ActionTypes.STATUS_MESSAGE,
            message: 'Uploading ' + file.name + '...',
            id: alertId,
            status: 'info'
        });

        assetStore.create(file, function(status, data) {

            var msg = (status === 'warning' ?
                'No tags found in ' + file.name :
                status === 'danger' ?
                'Upload unsuccessful!' :
                'Upload successful!');

            AppDispatcher.handleServerAction({
                type: ActionTypes.STATUS_MESSAGE_UPDATE,
                id: alertId,
                status: status,
                message: msg
            });

            var msecs = status === 'success' ? 1000 : 10000;

            setTimeout(function() {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.STATUS_MESSAGE_REMOVE,
                    id: alertId
                });
            }, msecs);

            if (status !== 'danger') {
                SceneActions.addMediaObject(sceneId, {
                    type: 'image',
                    url: data.url,
                    tags: data.tags,
                    style: {
                        'z-index': '1'
                    }
                });
            }
        });
    }
};

module.exports = SceneActions;
