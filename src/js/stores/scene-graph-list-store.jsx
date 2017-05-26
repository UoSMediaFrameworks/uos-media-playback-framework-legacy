'use strict';

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');

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

class SceneGraphListStore extends Store {

    constructor() {
        super(Dispatcher);
    }

    __onDispatch(payload) {
        var action = payload.action; // this is our action from handleViewAction
        switch(action.type){
            case ActionTypes.RECEIVE_SCENE_GRAPH_LIST:
                _addSceneGraphs(action.sceneGraphs);
                _loadingScenes = false;
                this.emitChange();
                break;
            case ActionTypes.RECEIVE_SCENE_GRAPH:
                _updateSceneGraph(action.sceneGraph);
                this.emitChange();
                break;
            case ActionTypes.DELETE_SCENE_GRAPH:
                delete _sceneGraphs[action.sceneGraphId];
                this.emitChange();
                break;
            case ActionTypes.HUB_LOGOUT:
                _sceneGraphs = {};
                this.emitChange();
                break;
        }
        return true;
    }

    getAll() {
        return _.values(_sceneGraphs);
    }

    loadingScenes() {
        return _loadingScenes;
    }

    emitChange() {
        super.__emitChange();
    };

    addChangeListener(callback) {
        super.addListener(callback);
    };

    removeChangeListener(callback) {
        // APEP TODO
    }
}

module.exports = new SceneGraphListStore();
