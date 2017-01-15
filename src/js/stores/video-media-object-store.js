/**
 * Created by Angel on 11/01/2017.
 */
var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';
var toastr = require('toastr');
var assign = require('object-assign');
var _videos = {};
function updateVideoInfo(videoInfo) {
    console.log("updateVideoInfo", videoInfo);
    _videos[videoInfo.parentId] = videoInfo;
}

var VideoMediaObjectStore = assign({}, EventEmitter.prototype, {

    getVideoInfo: function (parentId) {
        console.log("_videos", _videos,parentId)
        if (_videos.hasOwnProperty(parentId)) {
            return _.cloneDeep(_videos[parentId]);
        }
    },
    emitChange: function () {
        console.log("change event emited")
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        console.log("change event listener added")
        this.on(CHANGE_EVENT, callback);
    },


    removeChangeListener: function (callback) {
        console.log("change event removed")
        this.removeListener(CHANGE_EVENT, callback);
    },
    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;
        switch (action.type) {
            case ActionTypes.GET_TRANSCODED_STATUS_ATTEMPT:
                console.log("GET_TRANSCODED_STATUS_ATTEMPT", payload);
                toastr.info(payload.action.message);
                break;
            case ActionTypes.GET_TRANSCODED_STATUS_SUCCESS:
                console.log("GET_TRANSCODED_STATUS_SUCCESS", payload);
                updateVideoInfo(payload.action.value);
                VideoMediaObjectStore.emitChange();
                break;
            case ActionTypes.GET_TRANSCODED_STATUS_FAILURE:
                console.log("GET_TRANSCODED_STATUS_FAILURE", payload);
                VideoMediaObjectStore.emitChange();
                break;
        }
        return true;
    })

});
module.exports = VideoMediaObjectStore;
