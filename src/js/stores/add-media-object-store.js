'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';
var toastr = require('toastr');

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
                toastr.success('Media added successfully');
                _inputValue = '';
                _loading = false;
                break;

            case ActionTypes.ADD_MEDIA_FAILED:
                console.log(action)
                switch (action.value.status){
                    case 404:
                        toastr.warning('The media you are trying to add was not found');
                        break;
                    case 403:
                        toastr.warning('You are not authorized to add this sound.');
                        break;
                    case 503:
                        toastr.warning('media service is unavailable');
                        break;
                    case 504:
                        toastr.warning('Request took too long and failed.');
                        break;
                    default:
                        toastr.error('There has been a problem in the system');
                        break;
                }
                _loading = false;
                break;
        }

        AddMediaObjectStore.emitChange();
        return true;
    })
});

module.exports = AddMediaObjectStore;
