'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _loadingScenes = false;
var _scenes = {};

function _addScenes (scenes) {
	scenes.forEach(function(scene) {
		if (! _scenes[scene._id]) {
			_scenes[scene._id] = scene;
		}
	});
}

function _updateSceneName (_id, name, _groupID,_themes,_config) {

	if (_scenes.hasOwnProperty(_id)) {
		if (_scenes[_id].name !== name) {
			_scenes[_id].name = name;
            _scenes[_id]._groupID = _groupID;
            _scenes[_id]._themes = _themes;
            _scenes[_id]._config = _config;
			return true;
		}else{
            _scenes[_id].name = name;
            _scenes[_id]._groupID = _groupID;
            _scenes[_id]._themes = _themes;
            _scenes[_id]._config = _config;
            return true;
        }
	} else {
		_scenes[_id] = {name: name, _id: _id, _groupID: _groupID,_themes:_themes,_config:_config};
		return true;
	}
}

var SceneListStore = assign({}, EventEmitter.prototype, {
	getAll: function() {
		return _.values(_scenes);
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
            	if (_updateSceneName(scene._id, scene.name, scene._groupID,scene.themes,scene.config || {})) {
            		SceneListStore.emitChange();
            	}else{
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
