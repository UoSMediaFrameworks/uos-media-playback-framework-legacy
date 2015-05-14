'use strict';
/*jshint browser:true */

var TweenloopInterval = require('../tween-loop-interval');
var soundCloud = require('../sound-cloud');
var MediaObject = require('./media-object');
var inherits = require('inherits');
var TWEEN = require('tween.js');

inherits(AudioMediaObject, MediaObject);
module.exports = AudioMediaObject;

function AudioMediaObject (obj, ops) {
    MediaObject.call(this, obj, ops);
}

AudioMediaObject.typeName = 'audio';

function tweenAudio (player, start, end, duration) {
    var position = {vol: start};
    var target = {vol: end};
    return new TWEEN.Tween(position)
        .to(target, duration)
        .onUpdate(function() {
            player.volume(position.vol);
        });
}

AudioMediaObject.prototype.play = function() {
    var self = this,
        // hide inside of play() because Audio5 library bombs when loaded 
        // in a headless environment
        Audio5 = require('audio5');

    console.log('playing ' + this._obj.url, this._obj.tags);

    soundCloud.streamUrl(this._obj.url, function(streamUrl) {
        if (self._playing) {
            var volume = self._obj.volume;
            if (isNaN(volume)) {
                volume = 100;
            }
            volume = volume / 100;

            self._player = new Audio5({
                throw_errors: false,
                format_time: false,
                ready: function() {
                    if (self._playing) {
                        this.load(streamUrl);
                        this.volume(0);
                        this.play();
                        
                        tweenAudio(this, 0, volume, self._ops.transitionDuration).start();
                        
                        var transitionSeconds = self._ops.transitionDuration / 1000;
                        this.on('timeupdate', function (position, duration) {
                            if ((duration - position) < transitionSeconds || duration < transitionSeconds) {
                                self.transition();
                            }
                        });
                        this.on('error', function(err) {
                            console.log(err.toString());
                            self.emit('done', self);
                        });
                    }
                }
            });
        }
    });

    MediaObject.prototype.play.call(this);
};

AudioMediaObject.prototype.transition = function() {
    if (this._playing) {
        this._playing = false;
        this.emit('transition', this);

        console.log('stopping ' + this._obj.url);
        var position = {volume: this._player.volume()};
        var target = {volume: 0};
        var self = this;
        tweenAudio(this._player, this._player.volume(), 0, this._ops.transitionDuration)
            .onComplete(function() {
                self._player.pause();
                self.emit('done', self);
            })
            .start();
    }
};

AudioMediaObject.prototype.stop = function() {
    if (this._player && this._player.playing) {
        console.log('stopping ', this._obj.url);
        this._player.pause();    
        this.emit('done', this);
    }
};

