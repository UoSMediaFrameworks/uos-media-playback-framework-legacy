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
    recieveSceneGraphList: function(sceneGraphs) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_SCENE_GRAPH_LIST,
            sceneGraphs: sceneGraphs
        });
    },
    recieveScene: function(scene) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECIEVE_SCENE,
            scene: scene
        });
    },
    recieveSceneGraph: function(sceneGraph) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_SCENE_GRAPH,
            sceneGraph: sceneGraph
        });
    },
    recieveLoginResult: function(success, errorMessage) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.HUB_LOGIN_RESULT,
            result: success,
            errorMessage: errorMessage
        });
    },

    errorMessage: function(message) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.STATUS_MESSAGE,
            message: message,
            status: 'danger'
        });
    },

    recieveSceneListForPlayer: function(scenes) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.RECEIVE_SCENES_FROM_GRAPH,
            sceneIds: scenes
        });
    },

    recieveSceneAndThemeListForPlayer: function(scoreCommand) {

        var sceneIds = scoreCommand.play.scenes;
        var themes = scoreCommand.play.themes;

        AppDispatcher.handleViewAction({
            type: ActionTypes.RECIEVE_SCENES_AND_THEMES_FROM_SCORE,
            sceneIds: sceneIds,
            themes: themes
        });
    }
};

module.exports = HubRecieveActions;
