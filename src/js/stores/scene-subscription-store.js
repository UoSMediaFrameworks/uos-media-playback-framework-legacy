'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var SceneStore = require('./scene-store');

var CHANGE_EVENT = "change";
var _scene = {};

function _updateScene (scene) {
    _scene = scene;
}

var SceneSubscriptionStore = assign({}, EventEmitter.prototype, {
    getScene: function() {
        return _scene;
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
        var action = payload.action;
        switch(action.type){
            case ActionTypes.RECIEVE_SCENE:
                AppDispatcher.waitFor([SceneStore.dispatcherIndex]);
                _updateScene(action.scene);
                SceneSubscriptionStore.emitChange();
                break;
        }
        
        return true;
    })
});

module.exports = SceneSubscriptionStore;