'use strict';
var Dispatcher = require('./dispatcher.js');
var assign = require('object-assign');


var PayloadSources = require('../constants/scene-constants').PayloadSources;

var AppDispatcher = assign({}, Dispatcher.prototype, {
    handleViewAction: function(action) {
        console.log('VIEW_ACTION', action);
        this.dispatch({
            source: PayloadSources.VIEW_ACTION,
            action: action
        });
    },
    handleServerAction: function(action) {
        console.log('SERVER_ACTION', action);
        this.dispatch({
            source: PayloadSources.SERVER_ACTION,
            action: action
        });
    }
});

module.exports = AppDispatcher;
