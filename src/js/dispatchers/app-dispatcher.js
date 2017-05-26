'use strict';

var Dispatcher = require('./dispatcher');
var PayloadSources = require('../constants/scene-constants').PayloadSources;

// APEP TODO Refactor using ES6 and classes

module.exports = {
    handleViewAction: function(action) {
        console.log('VIEW_ACTION', action);
        Dispatcher.dispatch({
            source: PayloadSources.VIEW_ACTION,
            action: action
        });
    },
    handleServerAction: function(action) {
        console.log('SERVER_ACTION', action);
        Dispatcher.dispatch({
            source: PayloadSources.SERVER_ACTION,
            action: action
        });
    }
};
