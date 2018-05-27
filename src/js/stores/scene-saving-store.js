'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _sceneSaved = true;

var SceneSavingStore = assign({}, EventEmitter.prototype, {

    getSceneSaved: function() {
        // console.log("getSceneSaved: ", _sceneSaved);
        return _sceneSaved;
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
            case ActionTypes.SCENE_SAVING:
                _sceneSaved = action.saved;
                SceneSavingStore.emitChange();
                break;
        }

        return true;
    })
});

module.exports = SceneSavingStore;
