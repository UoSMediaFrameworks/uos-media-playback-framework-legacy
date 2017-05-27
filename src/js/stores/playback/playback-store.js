'use strict';

var Dispatcher = require('../../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var GraphViewerStore = require('../graph-viewer-store');
var ActionTypes = require('../../constants/scene-constants').ActionTypes;
var PlaybackTypes = require('../../constants/playback-constants').ActionTypes;
var _ = require('lodash');


class PlaybackStore extends Store {

    constructor() {
        super(Dispatcher);
        this.activeScene = null;
        this.activeTheme = null;
    }

    __onDispatch(payload) {
        var action = payload.action;

        switch(action.type) {
            case PlaybackTypes.SCENE_THEME_CHANGE:
                console.log("PlaybackStore got a SCENE_THEME_CHANGE event - action: ", action);

                this.activeScene = action.scene;
                this.activeTheme = action.themeQuery;
                this.emitChange();
                break;
            // case ActionTypes.RECIEVE_SCENES_AND_THEMES_FROM_SCORE:
            //
            //     console.log("PlaybackStore - pre wait for");
            //
            //     try {
            //         Dispatcher.waitFor([GraphViewerStore.getDispatchToken()]);
            //     } catch (e) {
            //         console.log("PlaybackStore - waitFor AppDispatcher - ERROR - e: ", e)
            //     }
            //
            //     console.log("PlaybackStore - We have waited for the store");
            //     break;
            default:
                break;
        }

        return true;
    }

    getActiveSceneAndTheme(){
        return {
            activeScene: this.activeScene,
            activeTheme: this.activeTheme
        }
    }

    getActiveScene() {
        return this.activeScene;
    }

    getActiveThemeQuery() {
        return this.activeTheme;
    }

    emitChange(){
        console.log("PlaybackStore emitting change");
        super.__emitChange();
    }

    addChangeListener(callback){
        console.log("PlaybackStore addChangeListener");
        super.addListener(callback);
    }

    removeChangeListener(callback){
        // APEP TODO
    }
}

module.exports = new PlaybackStore();
