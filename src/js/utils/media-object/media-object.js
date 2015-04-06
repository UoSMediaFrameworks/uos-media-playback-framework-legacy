'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

inherits(MediaObject, EventEmitter);
module.exports = MediaObject;

function MediaObject (obj) {
    this._obj = obj || {};

    this.tags = this._obj.tags ? parseTagString(this._obj.tags) : [];
    this.type = this._obj.type;
    this._playing = false;
}

function parseTagString (tagString) {
    return _.uniq(_.map(tagString.split(','), function(s) { return s.trim(); }));
}

MediaObject.prototype.play = function(parent, doneCb) {
    this._playing = true;
};

// triggers a hard stop
MediaObject.prototype.transition = function() {
    if (this._playing) {
        this._playing = false;
        this.emit('transition', this);

        setTimeout(function() {
            this.emit('done', this);    
        }.bind(this), 1400);    
    }    
};

// triggers a soft stop
MediaObject.prototype.stop = function() {
    if (this._playing) {
        this._playing = false;
        this.emit('transition', this);    
        this.emit('done', this);    
    }    
};

