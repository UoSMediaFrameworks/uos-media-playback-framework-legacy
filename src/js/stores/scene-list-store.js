'use strict';

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');

var _loadingScenes = false;
var _scenes = {};

function _addScenes (scenes) {
	scenes.forEach(function(scene) {
		if (! _scenes[scene._id]) {
			_scenes[scene._id] = scene;
		}
	});
}

function _updateSceneName (_id, name, _groupID) {

	if (_scenes.hasOwnProperty(_id)) {
		if (_scenes[_id].name !== name) {
			_scenes[_id].name = name;
            _scenes[_id]._groupID = _groupID;
			return true;
		}
	} else {
		_scenes[_id] = {name: name, _id: _id, _groupID: _groupID};
		return true;
	}
}

class SceneListStore extends Store {
    constructor() {
        super(Dispatcher);
    }
    __onDispatch(payload) {
        var action = payload.action; // this is our action from handleViewAction
        var scene;
        switch(action.type){
            case ActionTypes.RECIEVE_SCENE_LIST:
                _addScenes(action.scenes);
                _loadingScenes = false;
                this.emitChange();
                break;

            case ActionTypes.LIST_SCENES_ATTEMPT:
                _loadingScenes = true;
                this.emitChange();
                break;

            case ActionTypes.SCENE_CHANGE:
            case ActionTypes.RECIEVE_SCENE:
                scene = action.scene;
                if (_updateSceneName(scene._id, scene.name, scene._groupID)) {
                    this.emitChange();
                }
                break;

            case ActionTypes.DELETE_SCENE:
                delete _scenes[action.sceneId];
                this.emitChange();
                break;
            case ActionTypes.HUB_LOGOUT:
                _scenes = {};
                this.emitChange();
                break;
        }

        return true;
    }

    getAll() {
        return _.values(_scenes);
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


module.exports = new SceneListStore();
