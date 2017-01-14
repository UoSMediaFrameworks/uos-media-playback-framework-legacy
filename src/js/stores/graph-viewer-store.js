'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _scenes = [];

var GraphViewerStore = assign({}, EventEmitter.prototype, {

    getScenesForPlayback: function() {
        return _scenes;
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

    dispatcherIndex: AppDispatcher.register(function(payload) {
        var action = payload.action;

        switch(action.type) {
            case ActionTypes.RECEIVE_SCENES_FROM_GRAPH:

                _scenes = action.sceneIds;
                // APEP we have received a new request from the graph

                // APEP here we need to ensure that an change event is propagated

                // APEP we may how ever not be able to full fill playback until we receive the data required
            break;
        }

        GraphViewerStore.emitChange();

        return true;
    })
});

module.exports = GraphViewerStore;
