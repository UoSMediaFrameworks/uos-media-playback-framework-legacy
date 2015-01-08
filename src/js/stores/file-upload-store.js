'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;

var CHANGE_EVENT = "change";
var _fileStates = {};

var FileUploadStore = assign({}, EventEmitter.prototype, {
    getStates: function() {
        return _fileStates;
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
        var file;
        switch(action.type){
            case ActionTypes.UPLOAD_ASSET:
                file = action.file;
                _fileStates[file.name] = {state: 'info'};
                FileUploadStore.emitChange();
                break;

            case ActionTypes.UPLOAD_ASSET_RESULT:
                file = action.file;

                var state = _fileStates[file.name];
                state.state = action.status;
                state.message = action.msg;
                FileUploadStore.emitChange();
                break;
            
            case ActionTypes.UPLOAD_ASSET_RESULT_REMOVE:
                delete _fileStates[action.file.name];
                FileUploadStore.emitChange();
                break;
        }
        
        return true;
    })
});

module.exports = FileUploadStore;