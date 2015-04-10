'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');
var inherits = require('inherits');

module.exports = TemporalMediaObject;
inherits(TemporalMediaObject, MediaObject);

function TemporalMediaObject (obj) {
    MediaObject.call(this, obj);
}