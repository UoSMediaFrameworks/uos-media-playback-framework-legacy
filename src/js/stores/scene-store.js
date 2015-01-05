'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubSendActions = require('../actions/hub-send-actions');

var CHANGE_EVENT = "change";
var _scenes = {};

function _updateScene (scene) {
    _scenes[scene._id] = scene;
}

var SceneStore = assign({}, EventEmitter.prototype, {
    getScene: function(id) {
        if (_scenes.hasOwnProperty(id)) {
            return _scenes[id];    
        } else {
            HubSendActions.loadScene(id);
            return {};
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
            case ActionTypes.SCENE_CHANGE:
                _updateScene(action.scene);
                SceneStore.emitChange();
                break;

            case ActionTypes.RECIEVE_SCENE:
                _updateScene(action.scene);
                SceneStore.emitChange();
                break;
        }
        
        return true;
    })
});

module.exports = SceneStore;