
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash')

var CHANGE_EVENT = 'CHANGE_EVENT';
var PLAY_EVENT = 'PLAY_EVENT';
var TRACE_EVENT = 'TRACE_EVENT';

var moment = require("moment");

var _graphId = "";
var _recording = false;
var _breadcrumbs = {};
var _currentRecording = {name: "", breadcrumbs: []};

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
        this.emit(CHANGE_EVENT);
    },
    emitPlay: function (crumbs) {
        this.emit(PLAY_EVENT, crumbs);
    },
    emitTrace: function (crumbs) {
        this.emit(TRACE_EVENT, crumbs);
    },
    getBreadcrumbs: function () {
        return _breadcrumbs
    },
    setBreadcrumbs: function (graphId) {
        _graphId = graphId;
        var crumbs = localStorage.getItem(_graphId + " breadcrumbsList");
        if (crumbs == undefined) {
            crumbs = {"data": []};
            _breadcrumbs = crumbs;
        } else {
            _breadcrumbs = JSON.parse(crumbs);
        }
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
        return _recording;
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
    addCrumb: function (event, crumbName) {
        _currentRecording.breadcrumbs.push({
            event: event,
            node: crumbName,
            diff: getTimeDifference()
        });
    },
    clearBreadcrumbs: function () {
        _breadcrumbs = [];
        localStorage.setItem(_graphId + " breadcrumbsList", _breadcrumbs);
        BreadcrumbsStore.emitChange();
    },
    removeCrumb: function (props) {
        var parentCrumb = _breadcrumbs.data[props.parentIndex];
        parentCrumb.breadcrumbs.splice(props.index, 1);
        _breadcrumbs.data[props.parentIndex] = parentCrumb;
        BreadcrumbsStore.emitChange();
    },
    removeBreadcrumb: function (index) {
        _breadcrumbs.data.splice(index, 1);
        BreadcrumbsStore.emitChange();
    },
    startRecording: function () {
        _recording = true;
    },
    editName: function (name) {
        _currentRecording.name = name;
    },
    finishRecording: function () {
        _recording = false;
        addBreadcrums(_currentRecording);
        _currentRecording = {name: "", "breadcrumbs": []};
        localStorage.setItem(_graphId + " breadcrumbsList", JSON.stringify(_breadcrumbs));
        BreadcrumbsStore.emitChange();
    },
    playBreadcrumbs: function (index) {
        BreadcrumbsStore.emitPlay(_breadcrumbs.data[index])
    },
    traceBreadcrumbs: function (index) {
        BreadcrumbsStore.emitTrace(_breadcrumbs.data[index]);
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
