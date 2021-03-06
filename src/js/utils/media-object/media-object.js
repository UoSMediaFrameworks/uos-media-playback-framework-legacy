'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

inherits(MediaObject, EventEmitter);
module.exports = MediaObject;

function MediaObject (obj, ops) {
    this._obj = obj || {};
    this.style = this._obj.style || {};
    this.tags = this._obj.tags ? parseTagString(this._obj.tags) : [];
    this.type = this._obj.type;
    this._playing = false;
    this._ops = ops || {};

    if(this.type === "video") {
        console.log("MediaObject - VideoMediaObject - setting autoreplay: " + this._obj.autoreplay || 0);
        this.autoreplay = this._obj.autoreplay || 1;
    }
}

function parseTagString (tagString) {
    return _.uniq(_.map(tagString.split(','), function(s) { return s.trim(); }));
}

MediaObject.prototype.play = function() {

    console.log("Deprecated - MediaObject - play");

    this._playing = true;
};

// triggers a soft stop
MediaObject.prototype.transition = function() {

    console.log("Deprecated - MediaObject - transition");

    if (this._playing) {
        this._playing = false;
        this.emit('transition', this);

        setTimeout(function() {
            this.emit('done', this);
        }.bind(this), this._ops.transitionDuration);
    }
};

// triggers a hard stop
MediaObject.prototype.stop = function() {

    console.log("Deprecated - MediaObject - stop");

    if (this._playing) {
        this._playing = false;
        this.emit('transition', this);
        this.emit('done', this);
    }
};

