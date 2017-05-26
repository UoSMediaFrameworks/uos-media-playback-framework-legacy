'use strict';

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var hat = require('hat');
var _ = require('lodash');
var ActionTypes = require('../constants/scene-constants').ActionTypes;

var _messages = [];

function findMessage (id) {
    return _.find(_messages, function(m) { return m.id === id; });
}

class StatusMessageStore extends Store {
    constructor() {
        super(Dispatcher);
    }

    __onDispatch(payload) {
        var action = payload.action;
        var file, message;
        switch(action.type){
            case ActionTypes.UPLOAD_ASSET:
                file = action.file;
                _messages.push({id: file.name, state: 'info'});
                break;

            case ActionTypes.UPLOAD_ASSET_RESULT:
                file = action.file;
                message = findMessage(file.name);
                message.state = action.status;
                message.message = action.message;
                break;

            case ActionTypes.UPLOAD_ASSET_RESULT_REMOVE:
                delete _messages[action.file.name];
                break;

            case ActionTypes.STATUS_MESSAGE:
                _messages.push({
                    id: action.id || hat(),
                    message: action.message,
                    state: action.status
                });
                break;

            case ActionTypes.STATUS_MESSAGE_UPDATE:
                message = findMessage(action.id);
                message.state = action.status;
                message.message = action.message;
                break;

            case ActionTypes.STATUS_MESSAGE_REMOVE:
                var index = _.findIndex(_messages, function(m) { return m.id === action.id; });

                if (index !== -1) {
                    _messages.splice(index, 1);
                }
                break;
        }

        this.emitChange();

        return true;
    }

    getMessages() {
        return _messages;
    }

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

module.exports = new StatusMessageStore();
