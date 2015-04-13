'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');
var EmbeddedVimeoPlayer = require('../embedded-vimeo-player');
var getVimeoId = require('../get-vimeo-id');
var TweenloopInterval = require('../tween-loop-interval');
var TWEEN = require('tween.js');

function VideoMediaObject (obj, ops) {
    this._loading = false;
    MediaObject.call(this, obj, ops);
}

VideoMediaObject.prototype = Object.create(MediaObject.prototype);
VideoMediaObject.prototype.constructor = VideoMediaObject;

VideoMediaObject.typeName = 'video';

VideoMediaObject.prototype.makeElement = function(callback) {
    var player = new EmbeddedVimeoPlayer(getVimeoId(this._obj.url));

    this._loading = true;
    
    player.onReady(function(element) {
        this.element = element;

        callback();
    }.bind(this));
    
    this._player = player;
};

VideoMediaObject.prototype.getVolume = function() {
    var volume = this._obj.volume;
    if (isNaN(volume)) {
        volume = 100;
    }
    return volume / 100;
};

VideoMediaObject.prototype.play = function(ops) {
    this._loading = false;
    this._ops = ops;
    // vimeo player complains if you pass it 0, so we pass it just above zero
    this._player.postMessage('setVolume', this.getVolume() || 0.00001);
    this._player.postMessage('play');

    // setup transition stuff
    var transitionSeconds = ops.transitionDuration / 1000;
    this.element.style.transition = 'opacity ' + (ops.transitionDuration / 1000) + 's ease-in-out';
    this._player.onPlayProgress(function(data) {
        if ((data.duration - data.seconds) < transitionSeconds || data.duration < transitionSeconds ) {
            this.transition();
        }
    }.bind(this));

    MediaObject.prototype.play.call(this, ops);
};

VideoMediaObject.prototype.transition = function() {
    if (this._playing) {
        
        var position = {vol: this.getVolume()};
        var target = {vol: 0.00001};
        new TWEEN.Tween(position)
            .to(target, this._ops.transitionDuration)
            .onUpdate(function() {
                this._player.postMessage('setVolume', position.vol);
            }.bind(this))
            .start();
    }    

    MediaObject.prototype.transition.call(this);
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