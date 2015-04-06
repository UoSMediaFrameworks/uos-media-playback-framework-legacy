'use strict';
/*jshint browser:true */

var TemporalMediaObject = require('./temporal-media-object');
var EmbeddedVimeoPlayer = require('../embedded-vimeo-player');
var getVimeoId = require('../get-vimeo-id');

function VideoMediaObject (obj) {
    this._loading = false;
    TemporalMediaObject.call(this, obj);
}

VideoMediaObject.prototype = Object.create(TemporalMediaObject.prototype);
VideoMediaObject.prototype.constructor = VideoMediaObject;

VideoMediaObject.typeName = 'video';

VideoMediaObject.prototype.makeElement = function(callback) {
    var player = new EmbeddedVimeoPlayer(getVimeoId(this._obj.url));

    this._loading = true;
    
    player.onReady(function(element) {
        this.element = element;

        callback();
    }.bind(this));

    player.onPlayProgress(function(data) {
        if ((data.duration - data.seconds) < 1.4 || data.duration < 1.4) {
            this.transition();
        }
    }.bind(this));
    
    this._player = player;
};

VideoMediaObject.prototype.play = function() {
    this._loading = false;

    var volume = this._obj.volume;
    if (isNaN(volume)) {
        volume = 100;
    }
    volume = volume / 100;
    // vimeo player complains if you pass it 0, so we pass it just above zero
    this._player.postMessage('setVolume', volume || 0.00001);
    this._player.postMessage('play');

    TemporalMediaObject.prototype.play.call(this);
};

VideoMediaObject.prototype.stop = function() {
    if (this._loading || this._playing) {
        this._loading = this._playing = false;
        this.emit('done', this);    
    }
};

VideoMediaObject.prototype.onReady = function(callback) {
    this._player.onReady(callback);
};

module.exports = VideoMediaObject;