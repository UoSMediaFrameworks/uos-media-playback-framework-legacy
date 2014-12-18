var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var hat = require('hat');
var ActionTypes = SceneConstants.ActionTypes;

var SceneActions = {
    sceneChange: function(scene) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: scene
        });
        HubClient.save(scene);
    },

    addMediaObject: function(sceneId, mediaType, url, tags) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.ADD_MEDIA_OBJECT,
            sceneId: sceneId,
            mediaType: mediaType,
            mediaObjectId: hat(),
            url: url,
            tags: tags
        });
    },

    removeMediaObject: function(sceneId, mediaObjectId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.REMOVE_MEDIA_OBJECT,
            sceneId: sceneId,
            mediaObjectId: mediaObjectId
        });
    },

    logout: function() {
        AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGOUT
        });
        HubClient.logout();

        var AppRouter = require('../app-router.jsx');
        AppRouter.transitionTo('login');
    },

    uploadAsset: function(sceneId, file) {
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
        }

        var data = new FormData();
        data.append('image', file);
        data.append('token', HubClient.getToken());
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                SceneActions.addMediaObject(sceneId, 'image', data.url, data.tags.join(', '));    
                dispatchResult(true);
            } else {
                dispatchResult(false);
            }
        };

        xhr.onerror = function() {
            dispatchResult(false);
        };

        xhr.open('POST', 'http://smaassetstore.azurewebsites.net/upload/image');
        xhr.send(data);
    }
};

module.exports = SceneActions;  