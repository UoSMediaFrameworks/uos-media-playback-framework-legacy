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
                SceneGraphStore.emitChange();
                break;
            case ActionTypes.SCENE_GRAPH_REMOVE_SCENE:
                _removeSceneFromSceneGraph(action.sceneGraphId, action.sceneId);
                SceneGraphStore.emitChange();
                break;
        }

        SceneGraphStore.emitChange();

        return true;
    })
});

module.exports = SceneGraphStore;
