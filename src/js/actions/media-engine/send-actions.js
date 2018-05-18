'use strict';

const _ = require('lodash');

const AppDispatcher = require('../../dispatchers/app-dispatcher');
const MediaObjectState = require('../../private-dependencies/media-object-state');
const InternalEventConstants = require('../../private-dependencies/internal-event-constants');

module.exports = {

    // APEP publish to websocket listeners
    PLAY_MEDIA_COMMAND: "event.playback.media.show",
    API_PLAY_MEDIA_COMMAND: "event.playback.media.show",
    TRANSITION_MEDIA_COMMAND: "event.playback.media.transition",
    DONE_MEDIA_COMMAND: "event.playback.media.done",

    mediaObjectInstanceReady(connection, instance) {
        let instanceForUpdate = _.cloneDeep(instance);

        instanceForUpdate.state = new MediaObjectState({initialState: instance.state.state});

        instanceForUpdate.state.transition(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING);

        this.updateMediaInstance(this.PLAY_MEDIA_COMMAND, connection, instanceForUpdate);
    },

    updateMediaInstance(path, connection, instance) {

        console.log(`updateMediaInstance ${path}`);

        var MediaEngineConnection = require('../../utils/media-engine/connection');

        MediaEngineConnection.publishMediaInstanceStateChange(path, connection, instance);
    },

};
