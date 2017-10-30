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

    // APEP view action of the monaco editor trying to save scene JSON.
    sceneSaved: function(scene) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_SAVING,
            scene: scene,
            saved: true
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

    //TODO: Angel P : this is a temp fix , flow of the application needs to be revisited and redesigned
    savedScene: function(scene) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SAVED_SCENE,
            scene: scene
        });
    },
    savedSceneGraph: function(sceneGraph) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SAVED_SCENE_GRAPH,
            sceneGraph: sceneGraph
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
