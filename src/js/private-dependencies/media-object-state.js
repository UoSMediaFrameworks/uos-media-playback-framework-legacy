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
                // console.log('mo loaded')
                this.emit(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE_CHANGES.ON_LOADED);
            },
        },
        'playing': {
            _onEnter: function () {
                // console.log('mo playing')
                this.emit(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE_CHANGES.ON_PLAYING);
            },
        },
        'stopped': {
            _onEnter: function () {
                // console.log('mo stopped')
                this.emit(InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE_CHANGES.ON_DONE);
            },
        }
    }
});


module.exports = MediaObjectState;
