'use strict';
/*jshint browser:true */

var $ = require('jquery');
var getVimeoId = require('./get-vimeo-id');
var EmbeddedVimeoPlayer = require('./embedded-vimeo-player');
var SCENE_PLAYER_VIDEO_ID = 'scenePlayerVideoID';


function _animateInImage (el, img) {
    el.append(img);

    // random start position
    img.css({
        left: Math.random() * (el.width() - img.width()),
        top: Math.random() * (el.height() - img.height())
    });

    // and show
    img.addClass('show-media-object');
}



function _animateOutImage (el, img) {
    img.removeClass('show-media-object');
    window.setTimeout(function () {
        img.remove();
    }, 1400);
}

function ScenePlayerElementManager (element) {
    var $el = $(element);

    this._timeouts = [];
    this._videoDoneCb = null;
    // total number of active images being displayed
    this._imageCount = 0;
    
    this.el = $('<div class="image-wrapper"></div>');
    $el.append(this.el);
    this.videoPlayerEl =  $('<div id="' + SCENE_PLAYER_VIDEO_ID + '"></div>');
    $el.append(this.videoPlayerEl);
}


ScenePlayerElementManager.prototype.getImageCount = function() {
    return this._imageCount;
};

ScenePlayerElementManager.prototype.showVideo = function(vimeoUrl, doneCb) {
    var player = new EmbeddedVimeoPlayer(getVimeoId(vimeoUrl), SCENE_PLAYER_VIDEO_ID);
    
    player.onReady(function() {
        this.videoPlayerEl.addClass('show-media-object');
    }.bind(this));

    player.onFinish(function() {
        this.videoPlayerEl.removeClass('show-media-object');
        window.setTimeout(function() {
            this.videoPlayerEl[0].removeChild(player.element);
            doneCb();
        }.bind(this), 1000);
        
    }.bind(this));
    
    this.videoPlayerEl.append(player.element);
};

ScenePlayerElementManager.prototype.showImage = function(url, duration, doneCb) {
    this._imageCount++;
    var imgEl = new Image();
    var img = $(imgEl);
    imgEl.onload = function() {
        img.addClass('image-media-object');
        _animateInImage(this.el, img);
        this._timeouts.push(setTimeout(function() {
            _animateOutImage(this.el, img);
            this._imageCount--;
            doneCb();
        }.bind(this), duration));
    }.bind(this);

    imgEl.src = url;
};

module.exports = function(element) {
    return new ScenePlayerElementManager(element);
};