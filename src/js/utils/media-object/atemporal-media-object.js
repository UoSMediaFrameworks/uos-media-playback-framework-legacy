'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');

function AtemporalMediaObject (obj) {
    MediaObject.call(this, obj);
}

AtemporalMediaObject.prototype = Object.create(MediaObject.prototype);
AtemporalMediaObject.prototype.constructor = AtemporalMediaObject;

AtemporalMediaObject.prototype.onReady = function(callback) {
    callback();
};

module.exports = AtemporalMediaObject;