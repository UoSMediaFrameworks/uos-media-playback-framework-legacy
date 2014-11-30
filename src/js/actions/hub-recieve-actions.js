var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var ActionTypes = SceneConstants.ActionTypes;

var HubRecieveActions = {
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
    recieveSceneUpdate: function(scene) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: scene
        });
    },
    recieveLoginResult: function(success) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.HUB_LOGIN_RESULT,
            result: success
        });
    }
};

module.exports = HubRecieveActions;