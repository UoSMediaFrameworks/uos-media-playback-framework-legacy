'use strict';
/*jshint browser:true */

var TemporalMediaObject = require('./temporal-media-object');
var soundCloud = require('../sound-cloud');

function AudioMediaObject (obj) {
    TemporalMediaObject.call(this, obj);
}

AudioMediaObject.prototype = Object.create(TemporalMediaObject.prototype);
AudioMediaObject.prototype.constructor = AudioMediaObject;

AudioMediaObject.prototype.play = function(callback) {
    var Audio5 = require('audio5');

    var volume = this._obj.volume;
    if (isNaN(volume)) {
        volume = 100;
    }
    volume = volume / 100;

    soundCloud.streamUrl(this._obj.url, function(streamUrl) {
        var audio = new Audio5({
            ready: function(player) {
                this.load(streamUrl);
                this.play();
                this.volume(volume);
                this.on('ended', callback);
            }
        });
    });
    
};

module.exports = AudioMediaObject;