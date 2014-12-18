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
                _fileStates[file.name] = 'uploading';
                FileUploadStore.emitChange();
                break;

            case ActionTypes.UPLOAD_ASSET_RESULT:
                file = action.file;
                if (action.success) {
                    _fileStates[file.name] = 'uploaded successfully';
                } else {
                    _fileStates[file.name] = 'upload failed: ' + action.msg || 'unknown error';
                }
                FileUploadStore.emitChange();
        }
        
        return true;
    })
});

module.exports = FileUploadStore;