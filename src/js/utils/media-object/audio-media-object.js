'use strict';
/*jshint browser:true */

var TemporalMediaObject = require('./temporal-media-object');
var Audio5 = require('audio5');
var soundCloud = require('../sound-cloud');

function AudioMediaObject (obj) {
    TemporalMediaObject.call(this, obj);
}

AudioMediaObject.prototype = Object.create(TemporalMediaObject.prototype);
AudioMediaObject.prototype.constructor = AudioMediaObject;

module.exports = AudioMediaObject;