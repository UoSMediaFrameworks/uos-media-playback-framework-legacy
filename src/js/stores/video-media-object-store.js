'use strict'

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');
var toastr = require('toastr');
var _videos = {};

function updateVideoInfo(videoInfo) {
    console.log("VideoMediaObjectStore - updateVideoInfo: ", videoInfo);
    _videos[videoInfo.parentId] = videoInfo;
}

class VideoMediaObjectStore extends Store {
    constructor() {
        super(Dispatcher);
    }

    __onDispatch(payload) {
        var action = payload.action;
        switch (action.type) {
            // APEP TODO if we don't do anything in the store, we can refactor this out
            case ActionTypes.GET_TRANSCODED_STATUS_ATTEMPT:
                console.log("GET_TRANSCODED_STATUS_ATTEMPT", payload);
                break;
            case ActionTypes.GET_TRANSCODED_STATUS_SUCCESS:
                console.log("GET_TRANSCODED_STATUS_SUCCESS", payload);
                updateVideoInfo(payload.action.value);
                this.emitChange();
                break;
            case ActionTypes.GET_TRANSCODED_STATUS_FAILURE:
                console.log("GET_TRANSCODED_STATUS_FAILURE", payload);
                this.emitChange();
                break;
        }
        return true;
    }

    getVideoInfo(parentId) {
        if (_videos.hasOwnProperty(parentId)) {
            return _.cloneDeep(_videos[parentId]);
        }
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

module.exports = new VideoMediaObjectStore();
