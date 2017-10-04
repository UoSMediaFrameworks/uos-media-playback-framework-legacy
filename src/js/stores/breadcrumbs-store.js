var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');
var CHANGE_EVENT = 'CHANGE_EVENT';
var PLAY_EVENT = 'PLAY_EVENT';
var TRACE_EVENT = 'TRACE_EVENT';

var moment = require("moment");

var breadcrumbsState ={
    _graphId:"",
    _recording:false,
    _breadcrumbs:{},
    _currentRecording:{name: "", breadcrumbs: []}
};
var before, pause_start, pause_finished = null;

//If the breadcrumbs are stored on the mediahub we can change the structure a bit
//This store and functions is ment to aid the information manipulation flow between the breadcrumbs and graph componentss

function addBreadcrums(breadcrumb) {
    breadcrumbsState._breadcrumbs.data.push(breadcrumb)

};
var playBreadcrumbs = function (index) {
    BreadcrumbsStore.emitPlay(breadcrumbsState._breadcrumbs.data[index])
};
var traceBreadcrumbs= function (index) {
    BreadcrumbsStore.emitTrace(breadcrumbsState._breadcrumbs.data[index]);
};

var addCrumb= function (event, crumbName) {
    breadcrumbsState._currentRecording.breadcrumbs.push({
        event: event,
        node: crumbName,
        diff: getTimeDifference()
    });
};
var clearBreadcrumbs = function () {
    breadcrumbsState._breadcrumbs = [];
    localStorage.setItem(breadcrumbsState._graphId + " breadcrumbsList", breadcrumbsState._breadcrumbs);
    BreadcrumbsStore.emitChange();
};
var removeCrumb= function (props) {
    var parentCrumb = breadcrumbsState._breadcrumbs.data[props.parentIndex];
    parentCrumb.breadcrumbs.splice(props.index, 1);
    breadcrumbsState._breadcrumbs.data[props.parentIndex] = parentCrumb;
    BreadcrumbsStore.emitChange();
};
var removeBreadcrumb= function (index) {
    breadcrumbsState._breadcrumbs.data.splice(index, 1);
    BreadcrumbsStore.emitChange();
};
var startRecording= function () {
    breadcrumbsState._recording = true;
};
var editName=function (name) {
    breadcrumbsState._currentRecording.name = name;
};
var finishRecording= function () {
    breadcrumbsState._recording = false;
    addBreadcrums(breadcrumbsState._currentRecording);
    breadcrumbsState._currentRecording = {name: "", "breadcrumbs": []};
    localStorage.setItem(breadcrumbsState._graphId + " breadcrumbsList", JSON.stringify(breadcrumbsState._breadcrumbs));
    BreadcrumbsStore.emitChange();
};

var pauseRecording= function () {

    pause_start = moment(new Date());
    breadcrumbsState._recording = false;

};
var continueRecording= function () {
    pause_finished = moment(new Date());
    breadcrumbsState._recording = true;
};
function getTimeDifference() {
    var now, diff;
    now = moment(new Date());

    if (before == undefined) {
        before = now;
        diff = 0;
    }
    if (before != now) {
        if (pause_start != null && pause_finished != null) {
            before = before + pause_finished.diff(pause_start, 'milliseconds');
            pause_finished = pause_start = null;
        }
        diff = now.diff(before, 'milliseconds');

        before = now;
    }
    return diff;
}
var BreadcrumbsStore = assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },
    emitPlay: function (crumbs) {
        this.emit(PLAY_EVENT, crumbs);
    },
    emitTrace: function (crumbs) {
        this.emit(TRACE_EVENT, crumbs);
    },
    getBreadcrumbs: function () {
        return breadcrumbsState._breadcrumbs
    },
    importBreadcrumbs:function(crumbs){
        //APt - This will not switch the focus of the current breadcrumbs menu, as it might not be the correct graph which would cause usage issues.
      localStorage.setItem(crumbs.content.graphId+ " breadcrumbsList",JSON.stringify(crumbs.content));
      if(breadcrumbsState._graphId == crumbs.content.graphId){
          BreadcrumbsStore.setBreadcrumbs(crumbs.content.graphId);
      }
    },
    setBreadcrumbs: function (graphId) {
        breadcrumbsState._graphId = graphId;
        var crumbs = localStorage.getItem(breadcrumbsState._graphId + " breadcrumbsList");
        if (crumbs == undefined) {
            crumbs = {"data": []};
            breadcrumbsState._breadcrumbs = crumbs;
        } else {
            breadcrumbsState._breadcrumbs = JSON.parse(crumbs);
        }
         before, pause_start, pause_finished = null;
        BreadcrumbsStore.emitChange();
    },
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },
    addPlayListener: function (callback) {
        this.on(PLAY_EVENT, callback);
    },
    addTraceListener: function (callback) {
        this.on(TRACE_EVENT, callback);
    },
    getRecording: function () {
        return breadcrumbsState._recording;
    },
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },
    removePlayListener: function (callback) {
        this.removeListener(PLAY_EVENT, callback);
    },
    removeTraceListener: function (callback) {
        this.removeListener(TRACE_EVENT, callback);
    },
    dispatcherIndex: AppDispatcher.register(function(payload){
        var action = payload.action; // this is our action from handleViewAction

            switch(action.type){
                // should only be triggered when server sends data back, so no need to save
                case ActionTypes.BREADCRUMBS_CLEAR_ALL:
                    clearBreadcrumbs();
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_PLAY:
                    playBreadcrumbs(action.index);
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_TRACE:
                    traceBreadcrumbs(action.index);
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_REMOVE_CRUMBS:
                    removeBreadcrumb(action.index);
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_REMOVE_CRUMB:
                    removeCrumb(action.props);
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_ADD_CRUMB:
                    addCrumb(action.event,action.crumbName);
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_RECORD_START:
                    startRecording();
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_RECORD_PAUSE:
                    pauseRecording();
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_RECORD_CONTINUE:
                    continueRecording();
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_RECORD_FINISH:
                    finishRecording();
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_RECORD_EDIT_NAME:
                    editName(action.name);
                    BreadcrumbsStore.emitChange();
                    break;
                case ActionTypes.BREADCRUMBS_IMPORT_CRUMBS:
                    BreadcrumbsStore.importBreadcrumbs(action.crumbs);
                    BreadcrumbsStore.emitChange();
                    break;

            }


        return true;
    })
});

module.exports = BreadcrumbsStore;
