var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var ActionTypes = SceneConstants.ActionTypes;
var SceneActions = {
    sceneChange: function(scene) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: scene
        });
        HubClient.save(scene);
    },

    addMediaObject: function(id, mediaType, url, tags) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.ADD_MEDIA_OBJECT,
            id: id,
            mediaType: mediaType,
            url: url,
            tags: tags
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