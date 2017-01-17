'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');

var getVimeoId = require('../get-vimeo-id');
var TweenloopInterval = require('../tween-loop-interval');
var EmbeddedVimeoPlayer = require('../embedded-vimeo-player');
var SceneActions = require('../../actions/scene-actions');
var TWEEN = require('tween.js');

function VideoMediaObject(obj, ops) {
    this._loading = false;
    this._playbackTimeInterval = null; //APEP: ##Hack## for buffering media removal at the end
    MediaObject.call(this, obj, ops);
}

VideoMediaObject.prototype = Object.create(MediaObject.prototype);
VideoMediaObject.prototype.constructor = VideoMediaObject;

VideoMediaObject.typeName = 'video';

VideoMediaObject.prototype.play = function () {

    console.log("VideoMediaObject.prototype.makeElement - Deprecated");

    this._loading = false;
    // vimeo player complains if you pass it 0, so we pass it just above zero
    if(this._player.isVimeo) {
        this._player.vimeo_player.setVolume(this.getVolume() || 0.00001);
        this._player.vimeo_player.play();
        this._player.vimeo_player.setLoop(this.getLooping() || false);
    } else {
        this._player.raw_player.play();
    }

    // setup transition stuff
    var transitionSeconds = this._ops.transitionDuration / 1000;
    this._player._element.style.transition = 'opacity ' + (this._ops.transitionDuration / 1000) + 's ease-in-out';

    if(this._player.isVimeo) {
        this._player.onPlayProgress(function (data) {
            if ((data.duration - data.seconds) < transitionSeconds || data.duration < transitionSeconds) {
                console.log("Transition video player out - vimeo");
                this.transition();
            }
        }.bind(this));
    } else {
        var self = this;
        this._player._element.addEventListener('ended',function(e) {
            self.transition();
        },false);

        //APEP: ##Hack## for buffering media removal at the end
        if(this.play_duration !== null && this.play_duration > 0) {
            if(this._playbackTimeInterval) clearTimeout(this._playbackTimeInterval);
            this._playbackTimeInterval = setTimeout(function() {
                console.log("Buffering play duration failure - transition media object: ", self);
                self.transition();
            }, this.play_duration * 1.15 * 1000);
        }


    }

    MediaObject.prototype.play.call(this);
};

VideoMediaObject.prototype.makeElement = function (callback) {

    console.log("VideoMediaObject.prototype.makeElement - Deprecated");

    var isVimeo = this._obj.url.indexOf("vimeo.com") !== -1;
    var videoUrl = isVimeo ? getVimeoId(this._obj.url) : this._obj.url;

    var player = new EmbeddedVimeoPlayer(isVimeo, videoUrl);

    this._loading = true;

    this._player = player;

    if(!this._player.isVimeo) { //APEP: ##Hack## for buffering media removal at the end
        try {
            //APEP: ##Hack## for buffering media removal at the end
            this._player.raw_player.retrieveManifest(this._player.player_url, function(manifest) {

                console.log("VideoMediaObject.prototype.makeElement - retrieveManifest - manifest: ", manifest);

                try {
                    this.play_duration = manifest.Period.duration;
                } catch (e) {
                    console.log("VideoMediaObject.prototype.makeElement - retrieveManifest - error with manifest: ", e);
                }
                return callback();

            }.bind(this));
        } catch(e) {
            console.log("e: ", e);
            return callback();
        }
    } else {
        return callback();
    }
};

VideoMediaObject.prototype.getLooping = function () {
    return !(this.autoreplay == undefined || this.autoreplay < 1);
};
VideoMediaObject.prototype.getVolume = function () {
    var volume = this._obj.volume;
    if (isNaN(volume)) {
        volume = 100;
    }
    return volume / 100;
};


VideoMediaObject.prototype.transition = function () {

    console.log("VideoMediaObject.prototype.transition - TRANSITION - this: ", this);

    //APEP: ##Hack## for buffering media removal at the end
    if(this._playbackTimeInterval) clearTimeout(this._playbackTimeInterval);

    if (this._loading) {
        this._loading = false;
        this._player.onReady(null);
    } else if (this._playing) {
        this._playing = false;
        this.emit('transition', this);

        var position = {vol: this.getVolume()},
            target = {vol: 0.90},
            self = this;
        new TWEEN.Tween(position)
            .to(target, this._ops.transitionDuration)
            .onUpdate(function () {
                if(self._player.isVimeo)
                    self._player.vimeo_player.setVolume(position.vol);
                // else
                    // self._player.raw_player.setVolume(position.vol); //TODO fix
            })
            .onComplete(function () {
                if(!self._player.isVimeo) {
                    //APEP: Ensure player is reset in attempt for it to clean its GPU memory
                    self._player.raw_player.reset();
                }
                self.emit('done', self);
            })
            .onStop(function () {
                if(!self._player.isVimeo) {
                    //APEP: Ensure player is reset in attempt for it to clean its GPU memory
                    self._player.raw_player.reset();
                }
                self.emit('done', self);
            })
            .start();
    }

    MediaObject.prototype.transition.call(this);
};

VideoMediaObject.prototype.stop = function () {
    if (this._loading || this._playing) {
        this._loading = this._playing = false;
        this.emit('done', this);
    }
};

VideoMediaObject.prototype.onReady = function (callback) {
    this._player.onReady(callback);
};

module.exports = VideoMediaObject;
