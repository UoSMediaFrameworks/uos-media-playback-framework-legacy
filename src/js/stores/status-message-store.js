'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var hat = require('hat');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;

var CHANGE_EVENT = "change";
var _messages = [];

function findMessage (id) {
    return _.find(_messages, function(m) { return m.id === id; });
}

var StatusMessageStore = assign({}, EventEmitter.prototype, {
    getMessages: function() {
        return _messages;
    },
    emitChange: function(){
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback){
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback){
        this.removeListener(CHANGE_EVENT, callback);
    },

    dispatcherIndex: AppDispatcher.register(function(payload){
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

        StatusMessageStore.emitChange();

        return true;
    })
});

module.exports = StatusMessageStore;