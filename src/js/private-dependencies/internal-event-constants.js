'use strict';

const CONSTANTS = {
    BASE_TOPIC: "mediaframework.html.random.1.0.0.",
    ACTIVE_SCENE: {
        STATE_CHANGE: "scene_state_change",
        TOPICS: {
            active: "event.playback.scene.active",
            deactive: "event.playback.scene.deactive"
        },
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
            TRANSITION: 'transition',
            STOPPED: 'stopped'
        },
        STATE_CHANGES: {
            ON_LOADED: 'onLoaded',
            ON_PLAYING: 'onPlaying',
            ON_TRANSITION: 'onTransition',
            ON_DONE: 'onDone'
        },
        EVENTS: {
            STATE_CHANGE: "moi_state_change",
            PROPERTY_CHANGE: "moi_property_change"
        },
        TOPICS: {
            STATE_CHANGE: "event.playback.media.state.change",
            PROPERTY_CHANGE: "event.playback.media.property.change"
        }
    }
};

module.exports = CONSTANTS;
