'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubClient = require('../utils/HubClient');

var CHANGE_EVENT = "change";
var _sceneGraphs = {};

function _updateSceneGraph (sceneGraph) {
    _sceneGraphs[sceneGraph._id] = sceneGraph;
}

function _addSceneToSceneGraph (sceneGraphId, sceneId) {
    console.log("sceneGraphId: " + sceneGraphId + ", sceneId: " + sceneId);
    _sceneGraphs[sceneGraphId].sceneIds[sceneId] = sceneId;
    console.log("_addSceneToSceneGraph: ", _sceneGraphs[sceneGraphId]);
}

function _removeSceneFromSceneGraph (sceneGraphId, sceneId) {
    delete _sceneGraphs[sceneGraphId].sceneIds[sceneId];
}

function _addThemeExclusion (sceneGraphId, themeId) {
    console.log("_addThemeExclusion: ", { sceneGraphId: sceneGraphId, themeId: themeId});
    _sceneGraphs[sceneGraphId].excludedThemes[themeId] = {};
}

function _deleteThemeExclusion (sceneGraphId, themeId) {
    console.log("_deleteThemeExclusion: ", { sceneGraphId: sceneGraphId, themeId: themeId});
    delete _sceneGraphs[sceneGraphId].excludedThemes[themeId];
}

function _addThemeToSceneGraphStructure (sceneGraphId, themeId, parentList, parentKey) {
    console.log("_addThemeToSceneGraphStructure", { sceneGraphId: sceneGraphId, themeId: themeId, parent:parent, parentKey: parentKey});
    var graphThemes = _sceneGraphs[sceneGraphId]['graphThemes'];
    for(var parentIndex in parentList) {
        var parentKey = parentList[parentIndex];
        graphThemes = graphThemes[parentKey];
    }
    graphThemes[themeId] = {};
}

var SceneGraphStore = assign({}, EventEmitter.prototype, {
    getSceneGraph: function(id) {
        if (_sceneGraphs.hasOwnProperty(id)) {
            return _.cloneDeep(_sceneGraphs[id]);
        }
    },
    emitChange: function(){
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback){
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback){
        this.removeListener(CHANGE_EVENT, callback);
    },

    dispatcherIndex: AppDispatcher.register(function(payload){
        var action = payload.action; // this is our action from handleViewAction
        switch(action.type){
            // should only be triggered when server sends data back, so no need to save
            case ActionTypes.RECEIVE_SCENE_GRAPH:
                _updateSceneGraph(action.sceneGraph);
                SceneGraphStore.emitChange();
                break;
            case ActionTypes.SCENE_GRAPH_ADD_SCENE:
                _addSceneToSceneGraph(action.sceneGraphId, action.sceneId);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_REMOVE_SCENE:
                _removeSceneFromSceneGraph(action.sceneGraphId, action.sceneId);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_SELECTION:
                SceneGraphStore.emitChange();
                break;
            case ActionTypes.SCENE_GRAPH_EXCLUDE_THEME:
                _addThemeExclusion(action.sceneGraphId, action.themeId);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_ADD_THEME_TO_STRUCTURE:
                _addThemeToSceneGraphStructure(action.sceneGraphId, action.themeId, action.parentList, action.parentKey);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
        }

        SceneGraphStore.emitChange();

        return true;
    })
});

module.exports = SceneGraphStore;
