'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

inherits(MediaObject, EventEmitter);
module.exports = MediaObject;

function MediaObject (obj) {
    this._obj = obj;

    this.tags = obj.tags ? parseTagString(obj.tags) : [];
    this.type = obj.type;
}

function parseTagString (tagString) {
    return _.uniq(_.map(tagString.split(','), function(s) { return s.trim(); }));
}

MediaObject.prototype.play = function(parent, doneCb) {
    this.emit('play');
};

MediaObject.prototype.stop = function() {
    this.emit('stop');
};

