'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _loadingScenes = false;
var _sceneGraphs = {};

function _addSceneGraphs (sceneGraphs) {

    sceneGraphs.forEach(function(sceneGraph) {
        if (!_sceneGraphs[sceneGraph._id]) {
            _sceneGraphs[sceneGraph._id] = sceneGraph;
        }
    });

}

function _updateSceneGraph (sceneGraph) {
    _sceneGraphs[sceneGraph._id] = sceneGraph;
}

var SceneGraphListStore = assign({}, EventEmitter.prototype, {
    getAll: function() {
        return _.values(_sceneGraphs);
    },

    getSceneGraphByID:function(id){
        console.log(_sceneGraphs);
        if (_sceneGraphs.hasOwnProperty(id)) {
            return _.cloneDeep(_sceneGraphs[id]);
        }
    },

    loadingScenes: function() {
        return _loadingScenes;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    dispatcherIndex: AppDispatcher.register(function(payload){
        var action = payload.action; // this is our action from handleViewAction
        switch(action.type){
            case ActionTypes.RECEIVE_SCENE_GRAPH_LIST:
                _addSceneGraphs(action.sceneGraphs);
                _loadingScenes = false;
                SceneGraphListStore.emitChange();
                break;
            case ActionTypes.RECEIVE_SCENE_GRAPH:
                _updateSceneGraph(action.sceneGraph);
                SceneGraphListStore.emitChange();
                break;
            case ActionTypes.DELETE_SCENE_GRAPH:
                delete _sceneGraphs[action.sceneGraphId];
                SceneGraphListStore.emitChange();
                break;
            case ActionTypes.HUB_LOGOUT:
                _sceneGraphs = {};
                SceneGraphListStore.emitChange();
                break;
        }
        return true;
    })
});

module.exports = SceneGraphListStore;
