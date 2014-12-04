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

    removeMediaObject: function(sceneId, index) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.REMOVE_MEDIA_OBJECT,
            sceneId: sceneId,
            index: index
        });
    },

    logout: function() {
        AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGOUT
        });
        HubClient.logout();
    }
};

module.exports = SceneActions;  