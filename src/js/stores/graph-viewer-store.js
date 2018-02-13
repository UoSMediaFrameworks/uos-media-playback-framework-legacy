'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

// APEP singleton variables, this are non public
var _scenes = [];
var _themes = [];
var _isScore = false;
var _playFullScenes = false;
var _tourThemes = true; // APEP plumbed in ready to allow multiple themes to be joined (simultaneous) rather sequential

var lastActive = {
    activeScene:null,
    activeSceneId:null,
    themeQuery:null
};

var GraphViewerStore = assign({}, EventEmitter.prototype, {

    getScenesForPlayback: function() {
        // APEP Hack so if we from graph shuffle, if score do not
        if(_isScore) {
            return _.shuffle(_scenes);
        }

        return _scenes;
    },
    updateLastActive:function(obj){
        lastActive = obj;
    },

    getLastActive :function () {
       return lastActive;
    },

    getThemesForPlayback: function() {
        return _themes;
    },

    getPlayFullScenesOpt: function() {
        return _playFullScenes;
    },

    getThemeTourOpt: function() {
        return _tourThemes;
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
                _playFullScenes = false; // APEP do not offer this param through this type of command, as we expect a simple list
                _tourThemes = false; // APEP do not offer this param through this type of command
                GraphViewerStore.emitChange();
                break;

            case ActionTypes.RECIEVE_SCENES_AND_THEMES_FROM_SCORE:
                // APEP TODO handle errors - ie do hasOwnProperty or null checks
                _isScore = true; // APEP ensure we know are from score so we do not wish to shuffle
                _scenes = action.sceneIds;
                _themes = action.themes;
                _playFullScenes = action.playFullScenes; // APEP if we have received this additional param use it, otherwise it defaults to false
                _tourThemes = action.tour; // APEP default to tour themes rather than merge
                GraphViewerStore.emitChange();
                break;
        }
        return true;
    })
});

module.exports = GraphViewerStore;
