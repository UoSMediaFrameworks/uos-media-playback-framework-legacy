'use strict';

const _ = require('lodash');
const moment = require('moment');

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

    MEDIA_ENGINE_EVENT_COMMAND: "event.playback.media.engine.media.event",
    MEDIA_ENGINE_PROPERTY_CHANGE_COMMAND: "event.playback.media.engine.media.property.change",

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

    // Generic helper to publish change state request to controller,
    // See mediaObjectInstanceReady, mediaObjectInstanceFileEnded for DTO conversion
    // TODO review if cloneDeep is truly necessary, likely _.pick (or es6 alternatives - spread operator) the key fields is a smarter option when going back to controller
    updateMediaInstance(path, connection, instance) {

        // console.log(`updateMediaInstance ${path}`);

        var MediaEngineConnection = require('../../utils/media-engine/connection');

        MediaEngineConnection.publishMediaInstanceStateChange(path, connection, instance);
    },

    mediaObjectPublishEvent(instance) {

        var MediaEngineConnection = require('../../utils/media-engine/connection');

        let instanceForUpdate = _.cloneDeep(instance);

        instanceForUpdate.state = {
            state: instanceForUpdate.state.state
        };

        MediaEngineConnection.publishMediaInstanceEvent(this.MEDIA_ENGINE_EVENT_COMMAND, instanceForUpdate, parseInt(moment().format('x')))
    },

    mediaObjectPropertyChangePublishEvent(instance) {

        var MediaEngineConnection = require('../../utils/media-engine/connection');

        // TODO finalise full object vs partials
        // Using partials here as backend has full object and we only have a few key fields that can be changed in current version

        let instanceForUpdate = _.pick(instance, ["_id", "guid", "messageId", "_volume"]);

        MediaEngineConnection.publishMediaInstanceEvent(this.MEDIA_ENGINE_PROPERTY_CHANGE_COMMAND, instanceForUpdate, parseInt(moment().format('x')))
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
