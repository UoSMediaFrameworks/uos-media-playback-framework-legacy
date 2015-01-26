'use strict';
/*jshint browser:true */

var $ = require('jquery');
var createYouTubePlayer = require('./create-youtube-player');
var getYouTubeID = require('get-youtube-id');
var SCENE_PLAYER_VIDEO_ID = 'scenePlayerVideoID';
var EPromise = require('es6-promise').Promise;

function _animateInImage (el, img) {
    el.append(img);

    // random start position
    img.css({
        left: Math.random() * (el.width() - img.width()),
        top: Math.random() * (el.height() - img.height())
    });

    // and show
    img.animate({'opacity': 1}, 1400);
}

function _animateOutImage (el, img) {
    img.animate({'opacity': 0}, 1400, function () {
        img.remove();
    });
}

function ScenePlayerElementManager (element) {
    var $el = $(element);

    this._timeouts = [];
    this._videoDoneCb = null;
    
    this.el = $('<div class="image-wrapper"></div>');
    $el.append(this.el);
    this.videoPlayerEl =  $('<div id="' + SCENE_PLAYER_VIDEO_ID + '"></div>');
    $el.append(this.videoPlayerEl);

    this._youtubeLoadPromise = new EPromise(function(resolve, reject) {    
        createYouTubePlayer(SCENE_PLAYER_VIDEO_ID, function(player) {
            player.addEventListener('onReady', function(event) {
                player.mute();
                resolve(player);
            }.bind(this));

            player.addEventListener('onStateChange', function(event) {
                this._handleStateChange(event);
            }.bind(this));
        }.bind(this));
    }.bind(this));
}

ScenePlayerElementManager.prototype._handleStateChange = function(event) {
    switch(event.data) {

        case window.YT.PlayerState.ENDED: 
            this._videoDoneCb();
            break;

        default: 
            return;
    }
};

ScenePlayerElementManager.prototype.showVideo = function(url, cb) {
    this._videoDoneCb = cb;
    // show after the first one
    this.videoPlayerEl.css({'opacity': 1});
    this._youtubeLoadPromise.then(function(player) {
        player.loadVideoById(getYouTubeID(url));
    });
};

ScenePlayerElementManager.prototype.showImage = function(url) {
    var imgEl = new Image();
    var img = $(imgEl);
    imgEl.onload = function() {
        img.addClass('image-media-object');
        _animateInImage(this.el, img);
        this._timeouts.push(setTimeout(function() {
            _animateOutImage(this.el, img);
        }, 6000));
    }.bind(this);

    imgEl.src = url;
};

module.exports = function(element) {
    return new ScenePlayerElementManager(element);
};