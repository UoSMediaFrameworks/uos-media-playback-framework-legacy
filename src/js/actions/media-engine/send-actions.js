'use strict';

const _ = require('lodash');

const AppDispatcher = require('../../dispatchers/app-dispatcher');
const MediaObjectState = require('../../private-dependencies/media-object-state');
const InternalEventConstants = require('../../private-dependencies/internal-event-constants');

const MediaframeworkApi = require('../../utils/mf-api');
const HubReceiveActions = require('../../actions/hub-recieve-actions');

module.exports = {

    // APEP publish to websocket listeners
    PLAY_MEDIA_COMMAND: "event.playback.media.show",
    API_PLAY_MEDIA_COMMAND: "event.playback.media.show",
    TRANSITION_MEDIA_COMMAND: "event.playback.media.transition",
    DONE_MEDIA_COMMAND: "event.playback.media.done",

    mediaObjectInstanceReady(connection, instance) {
        let instanceForUpdate = _.cloneDeep(instance);

        instanceForUpdate.state = {
            state: InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING
        };

        this.updateMediaInstance(this.PLAY_MEDIA_COMMAND, connection, instanceForUpdate);
    },

    mediaObjectInstanceFileEnded(connection, instance) {
        let instanceForUpdate = _.cloneDeep(instance);

        instanceForUpdate.state = {
            state: InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.TRANSITION
        };

        this.updateMediaInstance(this.TRANSITION_MEDIA_COMMAND, connection, instanceForUpdate);
    },

    updateMediaInstance(path, connection, instance) {

        // console.log(`updateMediaInstance ${path}`);

        var MediaEngineConnection = require('../../utils/media-engine/connection');

        // APEP TODO prune instance fields not required for sending

        // let instanceForUpdate = _.cloneDeep(instance);
        //
        // instanceForUpdate.state = {
        //     state: instance.state.compositeState()
        // };

        MediaEngineConnection.publishMediaInstanceStateChange(path, connection, instance);
    },

    restartController() {

        HubReceiveActions.statusMessage(`requesting html random controller to restart to refresh data`);

        MediaframeworkApi.restartController()
            .then(succ => {
                let message = `html random controller restart request successful \n ${JSON.stringify(succ, null, 2)}`;
                HubReceiveActions.statusMessage(message)
            })
            .catch(err => {
                let message = `html random controller restart request error \n ${JSON.stringify(err, null, 2)}`;
                HubReceiveActions.errorMessage(message)
            })
    }
};
