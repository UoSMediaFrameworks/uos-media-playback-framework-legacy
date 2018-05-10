'use strict';

var AppDispatcher = require('../../dispatchers/app-dispatcher');

module.exports = {

    // APEP publish to websocket listeners
    PLAY_MEDIA_COMMAND: "event.playback.media.show",
    API_PLAY_MEDIA_COMMAND: "event.playback.media.show",
    TRANSITION_MEDIA_COMMAND: "event.playback.media.transition",
    DONE_MEDIA_COMMAND: "event.playback.media.done",

    updateMediaInstance(path, connection, instance) {

        console.log(`updateMediaInstance ${path}`)

        var MediaEngineConnection = require('../../utils/media-engine/connection');

        MediaEngineConnection.publishMediaInstanceStateChange(path, connection, instance);
    },

};
