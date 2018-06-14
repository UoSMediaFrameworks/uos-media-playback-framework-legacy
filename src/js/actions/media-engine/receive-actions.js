"use strict";

var MediaEngineConstants = require('../../constants/media-engine-constants');
var ActionTypes = MediaEngineConstants.ActionTypes;

var AppDispatcher = require('../../dispatchers/app-dispatcher.js');

var MediaEngineReceiveActions = {

    receiveActiveScene: function(activeScene) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_ACTIVE_SCENE,
            scene: activeScene
        });
    },

    receiveMediaObjectInstance: function(connection, instance) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_MEDIA_OBJECT_INSTANCE,
            connection: connection,
            instance: instance
        });
    },

    receiveMediaObjectInstanceProperty: function(connection, instance) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_MEDIA_OBJECT_INSTANCE_PROPERTY_CHANGE,
            connection: connection,
            instance: instance
        });
    },

    receiveControllerReset: function() {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_CONTROLLER_RESET
        });
    }
};

module.exports = MediaEngineReceiveActions;
