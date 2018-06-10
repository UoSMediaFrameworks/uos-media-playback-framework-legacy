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

let playingToTransitionTimers = new Map();
let transitionToStoppedTimers = new Map();

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

    _removeInstanceTimer: function(timerMap, instance) {
        // APEP 080618 if the timeout map is still recording the instance id, we should delete
        if(timerMap.has(instance._id)){
            timerMap.delete(instance._id);
        }
    },

    _mediaInstanceStateChange: function(connection, instance) {

        if (instance.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING) {
            let time = (instance._stopTime * 1000) - (instance._transitionTime * 1000);

            // console.log(`MediaEngineStore - setting timeout to transition in ${time}`);

            let transitionTimer = setTimeout(() => {
                // console.log(`MediaEngineStore - playing - transition firing`);

                let instanceForUpdate = _.cloneDeep(instance);
                instanceForUpdate.state = new MediaObjectState({initialState: instance.state.state});
                instanceForUpdate.state.transition(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.TRANSITION);

                // APEP 250418 TODO to be replaced with an API call... /playback/media/transition
                SendActions.updateMediaInstance(SendActions.TRANSITION_MEDIA_COMMAND, connection, instanceForUpdate);
            }, time);

            playingToTransitionTimers.set(instance._id, transitionTimer);

        } else if (instance.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.TRANSITION) {

            // APEP 090618 ensure we clean up the timer - if the Controller initialised this state change rather than a media engine
            this._removeInstanceTimer(playingToTransitionTimers, instance);

            let doneTimer = setTimeout(() => {
                // console.log(`MediaEngineStore - playing - done firing`);

                let instanceForUpdate = _.cloneDeep(instance);
                instanceForUpdate.state = new MediaObjectState({initialState: instance.state.state});
                instanceForUpdate.state.transition(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.STOPPED);

                // APEP 250418 TODO to be replaced with an API call... /playback/media/done
                SendActions.updateMediaInstance(SendActions.DONE_MEDIA_COMMAND, connection, instanceForUpdate);
            }, instance._transitionTime * 1000);

            transitionToStoppedTimers.set(instance._id, doneTimer);

        } else if (instance.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.STOPPED) {
            // APEP 030518 is deleting from the pool is not the right thing to do
            mediaInstancePool.delete(instance._id);

            this._removeInstanceTimer(transitionToStoppedTimers, instance);
            this._removeInstanceTimer(playingToTransitionTimers, instance);
        }
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        let self = this;

        switch (action.type) {

            case ActionTypes.RECEIVE_CONTROLLER_RESET:
                console.log("MediaEngineStore - Disconnection");

                try {
                    // Stop all the transition timeouts
                    _.forEach(playingToTransitionTimers.values(), timeout => {
                        clearTimeout(timeout);
                    });
                    playingToTransitionTimers.clear();

                    // Stop all the stop timers
                    _.forEach(transitionToStoppedTimers.values(), timeout => {
                        clearTimeout(timeout);
                    });
                    transitionToStoppedTimers.clear();

                    // Empty the instance pool
                    mediaInstancePool.clear();
                } catch (e) {
                    console.log(e);
                }

                console.log("MediaEngineStore - Disconnection - Tidy Complete")

                controllerConnection = null;
                MediaEngineStore.emitChange();
                break;

            case ActionTypes.RECEIVE_ACTIVE_SCENE:
                console.log("MediaEngineStore - The new store has received a message");
                break;

            case ActionTypes.RECEIVE_MEDIA_OBJECT_INSTANCE:
                let connection = action.connection;
                let instance = action.instance;

                // console.log(`MediaEngineStore - RECEIVE_MEDIA_OBJECT_INSTANCE - ${JSON.stringify(instance)}`);

                instance.state = new MediaObjectState({initialState: instance.state.state});

                controllerConnection = connection;

                try {

                    if (!mediaInstancePool.has(instance._id)) {
                        // APEP if this is the first time we are seeing the instance, we only accept instances at LOAD
                        let isInstanceAtBeginningState = instance.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.LOADED;

                        if(!isInstanceAtBeginningState) {
                            break;
                        }
                    }

                    let isStateTransition = mediaInstancePool.has(instance._id) ? mediaInstancePool.get(instance._id).state.compositeState() !== instance.state.compositeState() : true;

                    // APEP for any media object instance message - store the server copy in the instance pool
                    mediaInstancePool.set(instance._id, instance);

                    // APEP is the state property has specifically changed - we need to handle state transition logic
                    if(isStateTransition) {
                        // console.log(`state from DTO - isStateDirty ${isStateTransition} - ie Controller reported state: ${instance.state.compositeState()}`);
                        MediaEngineStore._mediaInstanceStateChange(connection, instance);
                        MediaEngineStore.emitChange();
                    }
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
