'use strict';
/*jshint browser:true */

var TemporalMediaObject = require('./temporal-media-object');

function AudioMediaObject (obj) {
    TemporalMediaObject.call(this, obj);
}

AudioMediaObject.prototype = Object.create(TemporalMediaObject.prototype);
AudioMediaObject.prototype.constructor = AudioMediaObject;

module.exports = AudioMediaObject;