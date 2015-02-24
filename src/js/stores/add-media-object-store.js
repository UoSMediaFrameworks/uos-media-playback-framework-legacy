'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _loading = false;
var _inputValue = '';

var AddMediaObjectStore = assign({}, EventEmitter.prototype, {
	loading: function() {
		return _loading;
	},

    inputValue: function() {
        return _inputValue;
    },

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},

	dispatcherIndex: AppDispatcher.register(function(payload){
        var action = payload.action; // this is our action from handleViewAction
        switch(action.type){
            case ActionTypes.ADD_MEDIA_ATTEMPT:
            	_inputValue = action.value;
                _loading = true;
                break;

            case ActionTypes.ADD_MEDIA_SUCCESS:
                _inputValue = '';
                _loading = false;
                break;

            case ActionTypes.ADD_MEDIA_FAILED:
                _loading = false;
                break;
        }        

        AddMediaObjectStore.emitChange();

        return true;
    })
});

module.exports = AddMediaObjectStore;