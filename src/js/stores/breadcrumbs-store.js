var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var assign = require('object-assign');
var _ = require('lodash')

var CHANGE_EVENT = 'CHANGE_EVENT';
var moment = require("moment");

var _graphId = "";
var _recording = false;
var _breadcrumbs = {};
var _currentRecording = {breadcrumbs:[]};

var before, pause_start, pause_finished = null;

//If the breadcrumbs are stored on the mediahub we can change the structure a bit
//This store and functions is ment to aid the information manipulation flow between the breadcrumbs and graph componentss

function addBreadcrums(breadcrumb) {
    _breadcrumbs.data.push(breadcrumb)

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
        console.log("Crumbs Change")
        this.emit(CHANGE_EVENT);
    },
    getBreadcrumbs: function () {
        console.log("gettingBreacrumbs");
        return _breadcrumbs
    },
    setBreadcrumbs:function (graphId){
        _graphId = graphId;
        var crumbs= localStorage.getItem(_graphId + " breadcrumbsList");
        _breadcrumbs = JSON.parse(crumbs);
        BreadcrumbsStore.emitChange();
    },
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },
    getRecording: function () {
        return _recording;
    },
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },
    addCrumb: function (event, crumbName) {
        _currentRecording.breadcrumbs.push({
            event: event,
            node: crumbName,
            diff: getTimeDifference()
        });
    },
    clearBreadcrumbs: function () {
      _breadcrumbs = [];
      localStorage.setItem(_graphId+ " breadcrumbsList",_breadcrumbs);
      BreadcrumbsStore.emitChange();
    },
    removeCrumb: function (props, event) {
        var parentCrumb  = _breadcrumbs.data[props.parentIndex];
        parentCrumb.breadcrumbs.splice(props.index,1);
        _breadcrumbs.data[props.parentIndex] = parentCrumb;
        BreadcrumbsStore.emitChange();
    },
    removeBreadcrumb: function (index,event) {
        _breadcrumbs.data.splice(index,1);
        BreadcrumbsStore.emitChange();
    },
    startRecording: function () {
        _recording = true;
    },
    finishRecording: function () {
        _recording = false;
        addBreadcrums(_currentRecording);
        _currentRecording = [];
        localStorage.setItem(_graphId+ " breadcrumbsList",JSON.stringify(_breadcrumbs));
        BreadcrumbsStore.emitChange();
    },
    pauseRecording: function () {
        pause_start = moment(new Date());
        _recording = false;
    },
    continueRecording: function () {
        pause_finished = moment(new Date());
        _recording = true;
    }
});

module.exports = BreadcrumbsStore;
