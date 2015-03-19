'use strict';

var _ = require('lodash');

function MediaObject (obj) {
    this._obj = obj;

    this.tags = parseTagString(obj.tags);
    this.type = obj.type;
}

function parseTagString (tagString) {
    return _.uniq(_.map(tagString.split(','), function(s) { return s.trim(); }));
}

MediaObject.prototype.play = function(parent, doneCb) {
    throw 'Not implemented!';
};

MediaObject.prototype.stop = function() {
    throw 'not implemented!';
};

module.exports = MediaObject;