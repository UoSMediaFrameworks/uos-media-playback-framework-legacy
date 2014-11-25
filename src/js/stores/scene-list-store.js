'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _scenes = {};

function _addScenes (scenes) {
	scenes.forEach(function(scene) {
		if (! _scenes[scene._id]) {
			_scenes[scene._id] = scene;
		}
	});
}

var SceneListStore = assign({}, EventEmitter.prototype, {
	getAll: function() {
		return _.values(_scenes);
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
            case ActionTypes.RECIEVE_SCENE_LIST:
            	_addScenes(action.scenes);
                SceneListStore.emitChange();
                break;
        }
        

        return true;
    })
});

module.exports = SceneListStore;