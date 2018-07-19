"use strict";

var SceneConstants = require('../../constants/scene-constants');
var ActionTypes = SceneConstants.ActionTypes;
var AppDispatcher = require('../../dispatchers/app-dispatcher.js');

var CacheActions = {

    cacheMessage: function(message) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.STATUS_MESSAGE,
            message: message,
            status: "success"
        });
    },

};

module.exports = CacheActions;
