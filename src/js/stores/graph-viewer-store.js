'use strict';

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');

var _scenes = [];
var _themes = [];
var _isScore = false;

class GraphViewerStore extends Store {

    constructor() {
        super(Dispatcher)
    }

    __onDispatch(payload) {
        var action = payload.action;

        switch(action.type) {
            case ActionTypes.RECEIVE_SCENES_FROM_GRAPH:
                _isScore = false; // APEP ensure we know we are from graph so we want shuffle
                _scenes = action.sceneIds;
                _themes = []; // APEP currently from graph we only get scenes so ensure we override any if used by scene and themes
                this.emitChange();
                // APEP we have received a new request from the graph, here we need to ensure that an change event is propagated
                // APEP we may how ever not be able to full fill playback until we receive the data required
                break;

            case ActionTypes.RECIEVE_SCENES_AND_THEMES_FROM_SCORE:
                // APEP handle errors - ie do hasOwnProperty or null checks
                _isScore = true; // APEP ensure we know are from score so we do not wish to shuffle
                _scenes = action.sceneIds;
                _themes = action.themes;
                this.emitChange();
                break;
        }
        return true;
    }

    getScenesForPlayback() {
        // APEP Hack so if we from graph shuffle, if score do not
        if(_isScore) {
            return _.shuffle(_scenes);
        }
        return _scenes;
    }

    getThemesForPlayback() {
        return _themes;
    }

    emitChange(){
        super.__emitChange();
    }

    addChangeListener(callback){
        super.addListener(callback);
    }

    removeChangeListener(callback){
        // APEP TODO
    }
}

module.exports = new GraphViewerStore();
