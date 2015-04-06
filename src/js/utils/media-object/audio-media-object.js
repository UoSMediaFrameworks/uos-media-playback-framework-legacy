'use strict';
/*jshint browser:true */

var TemporalMediaObject = require('./temporal-media-object');
var soundCloud = require('../sound-cloud');

function AudioMediaObject (obj) {
    TemporalMediaObject.call(this, obj);
}

AudioMediaObject.prototype = Object.create(TemporalMediaObject.prototype);
AudioMediaObject.prototype.constructor = AudioMediaObject;

AudioMediaObject.typeName = 'audio';

AudioMediaObject.prototype.play = function(callback) {
    var self = this,
        // hide inside of play() because Audio5 library bombs when loaded 
        // in a headless environment
        Audio5 = require('audio5');
    
    console.log('playing ' + this._obj.url, this._obj.tags);

    soundCloud.streamUrl(this._obj.url, function(streamUrl) {
        var volume = self._obj.volume;
        if (isNaN(volume)) {
            volume = 100;
        }
        volume = volume / 100;

        self._player = new Audio5({
            throw_errors: false,
            ready: function() {
                this.load(streamUrl);
                this.play();
                this.volume(volume);
                this.on('ended', callback);
                this.on('error', callback);
            }
        });
    });
    
};

AudioMediaObject.prototype.stop = function(fadeOutTime) {
    if (this._player && this._player.playing) {
        var fadeOutMs = fadeOutTime * 1000,
            resolution = 10,
            units = fadeOutMs / resolution,
            fadeAmount = this._player.volume() / units;
        console.log('fading ' + this._obj.url);

        var fadeOutInterval = window.setInterval(function() {
            if (this._player.volume() <= 0) {
                window.clearInterval(fadeOutInterval);
                this._player.pause();    
                console.log('stopping ', this._obj.url);
            } else {
                this._player.volume(this._player.volume() - fadeAmount);
            }
        }.bind(this), resolution);

        this.emit('done', this);
    }
};

module.exports = AudioMediaObject;