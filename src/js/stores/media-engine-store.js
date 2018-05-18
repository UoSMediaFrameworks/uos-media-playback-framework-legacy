'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');

var _ = require('lodash');

var EventEmitter = require('events').EventEmitter;

var ActionTypes = require('../constants/media-engine-constants').ActionTypes;

var CHANGE_EVENT = "change";

const MediaObjectState = require('../private-dependencies/media-object-state');
const InternalEventConstants = require('../private-dependencies/internal-event-constants');

const SendActions = require('../actions/media-engine/send-actions');

let mediaInstancePool = new Map();
let controllerConnection = null;

var MediaEngineStore = assign({}, EventEmitter.prototype, {

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getInstancePool: function() {
        return mediaInstancePool
    },

    getMedia: function() {
        return Array.from(mediaInstancePool.values());
    },

    getConnection: function() {
        return controllerConnection;
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action.type) {
            case ActionTypes.RECEIVE_ACTIVE_SCENE:
                console.log("MediaEngineStore - The new store has received a message");
                break;

            case ActionTypes.RECEIVE_MEDIA_OBJECT_INSTANCE:

                console.log("MediaEngineStore - RECEIVE_MEDIA_OBJECT_INSTANCE");

                let connection = action.connection;
                let instance = action.instance;

                instance.state = new MediaObjectState({initialState: instance.state.state});

                controllerConnection = connection;

                console.log(`state from DTO - ie Controller reported state: ${instance.state.compositeState()}`);

                try {

                    // APEP for any media object instance message - store the server copy in the instance pool
                    mediaInstancePool.set(instance._id, instance);

                    console.log(`${instance.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.LOADED}`);

                    if (instance.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING) {

                        console.log(`MediaEngineStore - setting timeout to stopped in ${instance._stopTime * 1000}`);

                        setTimeout(() => {

                            console.log(`MediaEngineStore - playing - done firing`);

                            let instanceForUpdate = _.cloneDeep(instance);
                            instanceForUpdate.state = new MediaObjectState({initialState: instance.state.state});

                            instanceForUpdate.state.transition(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.STOPPED);

                            // APEP 250418 to be replaced with an API call... /playback/media/done
                            SendActions.updateMediaInstance(SendActions.DONE_MEDIA_COMMAND, connection, instanceForUpdate);
                        }, instance._stopTime * 1000);

                    } else if (instance.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.STOPPED) {
                        // APEP 030518 is deleting from the pool is not the right thing to do
                        mediaInstancePool.delete(instance._id);
                    }

                    MediaEngineStore.emitChange();

                } catch (e) {
                    console.log(`error ${e.message}`);
                    console.log(e);
                    throw e
                }
                break;

            default:
                break;
        }

        return true;
    })
});

module.exports = MediaEngineStore;
