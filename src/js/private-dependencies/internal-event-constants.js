'use strict';

const CONSTANTS = {
    ACTIVE_SCENE: {
        STATE_CHANGE: "scene_state_change",
        STATE: {
            INIT: 'init',
            START: 'start',
            END: 'end'
        },
        EVENTS: {
            INTERVAL: 'interval'
        }
    },
    MEDIA_OBJECT_INSTANCE: {
        STATE: {
            LOADING: 'loading',
            LOADED: 'loaded',
            PLAYING: 'playing',
            STOPPED: 'stopped'
        },
        STATE_CHANGES: {
            ON_LOADED: 'onLoaded',
            ON_PLAYING: 'onPlaying',
            ON_DONE: 'onDone'
        },
        EVENTS: {
            STATE_CHANGE: "moi_state_change"
        }
    }
};

module.exports = CONSTANTS;