'use strict';

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');
var toastr = require('toastr');

var _loading = false;
var _inputValue = '';

class AddMediaObjectStore extends Store {
    constructor() {
        super(Dispatcher);
    }

    __onDispatch(payload) {
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
                switch (action.value.status){
                    case 404:
                        toastr.warning('The media you are trying to add was not found');
                        break;
                    case 403:
                        toastr.warning('You are not authorized to add this media.');
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

        this.emitChange();
        return true;
    }

    loading() {
        return _loading;
    }

    inputValue() {
        return _inputValue;
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

module.exports = new AddMediaObjectStore();
