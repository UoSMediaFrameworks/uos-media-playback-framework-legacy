var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var ActionTypes = SceneConstants.ActionTypes;

var HubRecieveActions = {

    tryListScenes: function() {
        AppDispatcher.handleViewAction({
            type: ActionTypes.LIST_SCENES_ATTEMPT,
        });
    },

    recieveSceneList: function(scenes) {
        AppDispatcher.handleServerAction({
        	type: ActionTypes.RECIEVE_SCENE_LIST,
        	scenes: scenes
        });
    },
    recieveScene: function(scene) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECIEVE_SCENE,
            scene: scene
        });
    },
    recieveLoginResult: function(success, errorMessage) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.HUB_LOGIN_RESULT,
            result: success,
            errorMessage: errorMessage
        });
    }
};

module.exports = HubRecieveActions;