'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');

function VideoMediaObject (obj) {
    MediaObject.call(this, obj);
}

VideoMediaObject.prototype = Object.create(MediaObject.prototype);
VideoMediaObject.prototype.constructor = VideoMediaObject;

module.exports = VideoMediaObject;