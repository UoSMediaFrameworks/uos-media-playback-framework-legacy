/**
 * Created by aaronphillips on 16/01/2017.
 */
'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var CHANGE_EVENT = "change";
var _scenes = {};

function _updateScene (scene) {
    _scenes[scene._id] = scene;
}

var FullSceneStore = assign({}, EventEmitter.prototype, {
    getScene: function(id) {
        if (_scenes.hasOwnProperty(id)) {
            return _.cloneDeep(_scenes[id]);
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
            case ActionTypes.RECIEVE_FULL_SCENE:
                _updateScene(action.scene);
                FullSceneStore.emitChange();
                break;
        }

        FullSceneStore.emitChange();

        return true;
    })
});

module.exports = FullSceneStore;
