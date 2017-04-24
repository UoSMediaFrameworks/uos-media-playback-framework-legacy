'use strict';

// APEP the work done in this change is non complete, ie it raises higher level questions in which we should discuss the
// final solution

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var SceneSummariser = require('../utils/scene-summariser');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _loadingScenes = false;
var _scenes = {};
var _scene_meta_data = {};


function _addScenes (scenes) {
	scenes.forEach(function(scene) {
		if (! _scenes[scene._id]) {
			_scenes[scene._id] = scene;
            _scene_meta_data[scene._id] = SceneSummariser.summarise(scene);
		}
	});
}

// APEP TODO I think we are missing a full scene update, as we should be looking to aggregate scene data with some
// APEP - 24/04/2017 TODO Above comment is invalid - this store should not copy the SceneStore and should container only higher level details of the scene for listing
// APEP I propose a refactor and careful find usages of this store needs to be done and refactor components using the incorrect store
function _updateScene (scene) {
    if (_scenes.hasOwnProperty(_id)) {
        _scenes[scene._id] = scene;
        _scene_meta_data[scene._id] = SceneSummariser.summarise(scene);
        return true;
    }
}

// APEP TODO deprecated and needs to be solved in refactor - see above comment set
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

var SceneListStore = assign({}, EventEmitter.prototype, {
	getAll: function() {
		return _.values(_scenes);
	},

    getSceneMeta: function(scene) {
        console.log("scene: ", scene);
        // console.log("_scene_meta_data: ", _scene_meta_data);
        // console.log("_scene_meta_data[scene._id]: ", _scene_meta_data[scene._id]);
        // console.log("_.cloneDeep(_scene_meta_data[scene._id]: ", _.cloneDeep(_scene_meta_data[scene._id]))

        if (_scene_meta_data.hasOwnProperty(scene._id)){
            console.log("HAS SCENE FOR META");
        } else {
            console.log("Gez")
        }
        return _.cloneDeep(_scene_meta_data[scene._id]);
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
        var scene;
        switch(action.type){
            case ActionTypes.RECIEVE_SCENE_LIST:
            	_addScenes(action.scenes);
            	_loadingScenes = false;
                SceneListStore.emitChange();
                break;

            case ActionTypes.LIST_SCENES_ATTEMPT:
            	_loadingScenes = true;
            	SceneListStore.emitChange();
            	break;

            case ActionTypes.SCENE_CHANGE:
            case ActionTypes.RECIEVE_SCENE:
            	scene = action.scene;
            	if (_updateScene(scene)) {
            		SceneListStore.emitChange();
            	}
            	break;

            case ActionTypes.DELETE_SCENE:
                delete _scenes[action.sceneId];
                SceneListStore.emitChange();
                break;
            case ActionTypes.HUB_LOGOUT:
                _scenes = {};
                SceneListStore.emitChange();
                break;
        }


        return true;
    })
});

module.exports = SceneListStore;
