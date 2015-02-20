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
}


ScenePlayerElementManager.prototype.showVideo = function(vimeoUrl, doneCb) {
    var player = new EmbeddedVimeoPlayer(getVimeoId(vimeoUrl), SCENE_PLAYER_VIDEO_ID);
    
    player.onReady(function() {
        this.videoPlayerEl.addClass('show');
    }.bind(this));

    player.onFinish(function() {
        this.videoPlayerEl.removeClass('show');
        window.setTimeout(function() {
            this.videoPlayerEl[0].removeChild(player.element);
            doneCb();
        }.bind(this), 1000);
        
    }.bind(this));
    
    this.videoPlayerEl.append(player.element);
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