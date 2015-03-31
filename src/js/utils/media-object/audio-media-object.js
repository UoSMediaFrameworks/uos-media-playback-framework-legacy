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
            ready: function(player) {
                this.load(streamUrl);
                this.play();
                this.volume(volume);
                this.on('ended', callback);
            }
        });
    });
    
};

AudioMediaObject.prototype.stop = function() {
    if (this._player.playing) {
        this._player.pause();    
        console.log('stopping ', this._obj.url);
    } else {
        throw 'stopping already stopped audio ' + this._obj.url;
    }
};

module.exports = AudioMediaObject;