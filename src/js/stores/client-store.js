'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';

var _loggedIn = false;
var _errorMessage = false;
var _attemptingLogin = false;

var ClientStore = assign({}, EventEmitter.prototype, {
	loggedIn: function() {
		return _loggedIn;
	},

    errorMessage: function() {
        return _errorMessage;
    },

    attemptingLogin: function() {
        return _attemptingLogin;
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
            case ActionTypes.HUB_LOGIN_RESULT:
            	_loggedIn = action.result;
                _attemptingLogin = false;
                if (! _loggedIn) {
                    _errorMessage = action.errorMessage;
                }
                ClientStore.emitChange();
                break;

            case ActionTypes.HUB_LOGOUT:
                _loggedIn = _attemptingLogin = false;
                _errorMessage = null;
                ClientStore.emitChange();
                break;

            case ActionTypes.HUB_LOGIN_ATTEMPT:
                _attemptingLogin = true;
                _errorMessage = null;
                ClientStore.emitChange();
                break;
        }        

        return true;
    })
});

module.exports = ClientStore;