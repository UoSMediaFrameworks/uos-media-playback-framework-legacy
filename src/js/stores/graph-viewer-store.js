'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _scenes = [];
var _themes = [];
var _isScore = false;

var GraphViewerStore = assign({}, EventEmitter.prototype, {

    getScenesForPlayback: function() {

        // APEP Hack so if we from graph shuffle, if score do not

        if(_isScore) {
            return _.shuffle(_scenes);
        }

        return _scenes;
    },

    getThemesForPlayback: function() {
        return _themes;
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
                _isScore = false; // APEP ensure we know we are from graph so we want shuffle
                _scenes = action.sceneIds;
                _themes = []; // APEP currently from graph we only get scenes so ensure we override any if used by scene and themes
                GraphViewerStore.emitChange();
                // APEP we have received a new request from the graph

                // APEP here we need to ensure that an change event is propagated

                // APEP we may how ever not be able to full fill playback until we receive the data required
            break;

            case ActionTypes.RECIEVE_SCENES_AND_THEMES_FROM_SCORE:
                // APEP handle errors - ie do hasOwnProperty or null checks
                _isScore = true; // APEP ensure we know are from score so we do not wish to shuffle
                _scenes = action.sceneIds;
                _themes = action.themes;
                GraphViewerStore.emitChange();
                break;
        }
        return true;
    })
});

module.exports = GraphViewerStore;
