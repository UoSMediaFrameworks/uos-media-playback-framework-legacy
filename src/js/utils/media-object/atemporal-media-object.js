'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');

function AtemporalMediaObject (obj) {
    MediaObject.call(this, obj);
}

AtemporalMediaObject.prototype = Object.create(MediaObject.prototype);
AtemporalMediaObject.prototype.constructor = AtemporalMediaObject;

module.exports = AtemporalMediaObject;