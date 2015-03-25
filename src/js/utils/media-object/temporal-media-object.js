'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');

function TemporalMediaObject (obj) {
    MediaObject.call(this, obj);
}

TemporalMediaObject.prototype = Object.create(MediaObject.prototype);
TemporalMediaObject.prototype.constructor = TemporalMediaObject;

module.exports = TemporalMediaObject;