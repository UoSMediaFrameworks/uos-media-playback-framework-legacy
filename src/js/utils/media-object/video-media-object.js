'use strict';
/*jshint browser:true */

var TemporalMediaObject = require('./temporal-media-object');
var EmbeddedVimeoPlayer = require('../embedded-vimeo-player');
var getVimeoId = require('../get-vimeo-id');

function VideoMediaObject (obj) {
    TemporalMediaObject.call(this, obj);
}

VideoMediaObject.prototype = Object.create(TemporalMediaObject.prototype);
VideoMediaObject.prototype.constructor = VideoMediaObject;

VideoMediaObject.prototype.makeElement = function(callback) {
    var player = new EmbeddedVimeoPlayer(getVimeoId(this._obj.url));
    
    player.onReady(function(element) {
        callback(element);
    }.bind(this));

    this._player = player;
};

VideoMediaObject.prototype.play = function() {
    var volume = (this._obj.volume || 100) / 100;
    this._player.postMessage('setVolume', volume);
    this._player.postMessage('play');
};

VideoMediaObject.prototype.onReady = function(callback) {
    this._player.onReady(callback);
};

VideoMediaObject.prototype.onFinish = function(callback) {
    this._player.onFinish(callback);
};

module.exports = VideoMediaObject;