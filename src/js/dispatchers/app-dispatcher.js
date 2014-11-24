'use strict';
var Dispatcher = require('./dispatcher.js'),
    merge = require('react/lib/merge');

var AppDispatcher = merge(Dispatcher.prototype, {
    handleViewAction: function(action) {
        console.log(action);
        this.dispatch({
            source: 'VIEW_ACTION',
            action: action
        });
    }
});

module.exports = AppDispatcher;