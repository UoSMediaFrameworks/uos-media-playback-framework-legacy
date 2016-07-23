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
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_GRAPH_EXCLUDE_THEME,
            sceneGraphId: sceneGraphId,
            themeId: themeId
        });
    },

    addThemeIntoSceneGraph: function(parentList, parentKey, themeId, sceneGraphId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_GRAPH_ADD_THEME_TO_STRUCTURE,
            parentList: parentList,
            parentKey: parentKey,
            sceneGraphId: sceneGraphId,
            themeId: themeId
        });
    }
};

module.exports = SceneGraphActions;
