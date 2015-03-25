'use strict';
/*jshint browser:true */

var TemporalMediaObject = require('./temporal-media-object');

function VideoMediaObject (obj) {
    TemporalMediaObject.call(this, obj);
}

VideoMediaObject.prototype = Object.create(TemporalMediaObject.prototype);
VideoMediaObject.prototype.constructor = VideoMediaObject;

module.exports = VideoMediaObject;