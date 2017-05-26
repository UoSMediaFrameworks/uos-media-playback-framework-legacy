'use strict';

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');

var _loggedIn = false;
var _errorMessage = false;
var _attemptingLogin = false;

class ClientStore extends Store {
    constructor() {
        super(Dispatcher);
    }

    __onDispatch(payload) {

        var action = payload.action; // this is our action from handleViewAction
        switch(action.type){
            case ActionTypes.HUB_LOGIN_RESULT:
                _loggedIn = action.result;
                _attemptingLogin = false;
                if (! _loggedIn) {
                    _errorMessage = action.errorMessage;
                }
                this.emitChange();
                break;

            case ActionTypes.HUB_LOGOUT:
                _loggedIn = _attemptingLogin = false;
                _errorMessage = null;
                this.emitChange();
                break;

            case ActionTypes.HUB_LOGIN_ATTEMPT:
                _attemptingLogin = true;
                _errorMessage = null;
                this.emitChange();
                break;
        }
        return true;
    }

    loggedIn() {
        return _loggedIn;
    };

    errorMessage() {
        return _errorMessage;
    };

    attemptingLogin() {
        return _attemptingLogin;
    };

    emitChange() {
        super.__emitChange();
    };

    addChangeListener(callback) {
        super.addListener(callback);
    };

    removeChangeListener(callback) {
        // APEP TODO
    }
}

module.exports = new ClientStore();
