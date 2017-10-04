/**
 * Created by Angel on 31/05/2017.
 */
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');

var CHANGE_EVENT = 'CHANGE_EVENT';

var moment = require("moment");

var timeoutProps = {
    enabled: false,
    node_switch_duration: 1000  * 7,
    inactivity_wait_duration: 1000  * 30
};

var AutowalkStore = assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(CHANGE_EVENT,timeoutProps);
    },
    getTimeoutProps: function () {
        return timeoutProps;
    },
    updateTimeoutProps: function(props){
        timeoutProps = props;
        AutowalkStore.emitChange();
    },
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }

});
module.exports = AutowalkStore;
