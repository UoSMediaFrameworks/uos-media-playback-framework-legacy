'use strict';
/*jshint browser: true */
var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var SceneConstants = require('../constants/scene-constants');
var ActionTypes = SceneConstants.ActionTypes;

var SceneGraphActions = {

    updateSceneGraph: function(sceneGraph) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_GRAPH_UPDATE,
            sceneGraph: sceneGraph,
        });
    },

    addScene: function(sceneGraphId, sceneId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_GRAPH_ADD_SCENE,
            sceneGraphId: sceneGraphId,
            sceneId: sceneId
        });
    },

    removeScene: function(sceneGraphId, sceneId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_GRAPH_REMOVE_SCENE,
            sceneGraphId: sceneGraphId,
            sceneId: sceneId
        });
    },

    selectSceneForSceneGraphDisplay: function(sceneGraphId, sceneId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_GRAPH_SELECTION,
            sceneGraphId: sceneGraphId,
            sceneId: sceneId
        });
    },

    excludeTheme: function(themeId, sceneGraphId) {

    }
};

module.exports = SceneGraphActions;
