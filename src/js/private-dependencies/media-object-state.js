'use strict';

// APEP 090418 review of the state machine that is not hand crafted
const InternalEventConstants = require('./internal-event-constants');
const _ = require("lodash");
const machina = require("machina");


let MediaObjectState = machina.Fsm.extend({
    initialize: function (opts) {

    },

    namespace: "media-object-state",

    initialState: InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.LOADING,

    reset: function () {
        this.transition(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.LOADING);
    },

    states: {
        'loading': {

        },
        'loaded': {
            _onEnter: function () {
                this.emit(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE_CHANGES.ON_LOADED);
            },
        },
        'playing': {
            _onEnter: function () {
                this.emit(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE_CHANGES.ON_PLAYING);
            },
        },
        'transition': {
            _onEnter: function () {
                this.emit(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE_CHANGES.ON_TRANSITION);
            },
        },
        'stopped': {
            _onEnter: function () {
                this.emit(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE_CHANGES.ON_DONE);
            },
        }
    }
});


module.exports = MediaObjectState;
