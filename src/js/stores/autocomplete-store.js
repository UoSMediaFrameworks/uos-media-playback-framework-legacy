'use strict';
/**
 * Created by Angel on 15/03/2018.
 */
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var CHANGE_EVENT = 'CHANGE_EVENT';
var ActionTypes = require('../constants/scene-constants').ActionTypes;


var autocompleteSelectedValue = null;
var AutocompleteStore = assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(CHANGE_EVENT,autocompleteSelectedValue);
    },
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },
    getSelectedValue:function(){
        return autocompleteSelectedValue;
    },
    dispatcherIndex:AppDispatcher.register(function (payload) {
        var action = payload.action; // this is our action from handleViewAction
        console.log(action.type);
        switch (action.type) {
            case ActionTypes.AUTOCOMPLETE_SELECTED_UPDATE:
                autocompleteSelectedValue = action.value;
                AutocompleteStore.emitChange();
                break;
        }
    })
});

module.exports = AutocompleteStore;
