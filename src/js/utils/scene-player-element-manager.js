'use strict';
/*jshint browser:true */

var $ = require('jquery');
var getVimeoId = require('./get-vimeo-id');
var EmbeddedVimeoPlayer = require('./embedded-vimeo-player');


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



function _animateOutElement (el, img) {
    img.removeClass('show-media-object');
    window.setTimeout(function () {
        img.remove();
    }, 1400);
}

function ScenePlayerElementManager (element) {
    var $el = $(element);

    this._videoDoneCb = null;
    // total number of active items being displayed
    this._imageCount = 0;
    this._textCount = 0;
    
    this.el = $('<div class="media-object-wrapper"></div>');
    $el.append(this.el);
    $el.append(this.videoPlayerEl);
}


ScenePlayerElementManager.prototype.getImageCount = function() {
    return this._imageCount;
};

ScenePlayerElementManager.prototype.getTextCount = function() {
    return this._textCount;
};

ScenePlayerElementManager.prototype.showVideo = function(vimeoUrl, doneCb) {
    var player = new EmbeddedVimeoPlayer(getVimeoId(vimeoUrl));
    
    player.onReady(function() {
        $(player.element).addClass('show-media-object');
    }.bind(this));

    player.onFinish(function() {
        $(player.element).removeClass('show-media-object');
        window.setTimeout(function() {
            this.el[0].removeChild(player.element);
            doneCb();
        }.bind(this), 1000);
        
    }.bind(this));
    
    this.el.append(player.element);
};

ScenePlayerElementManager.prototype.showImage = function(url, duration, doneCb) {
    this._imageCount++;
    var imgEl = new Image();
    var img = $(imgEl);
    imgEl.onload = function() {
        img.addClass('image-media-object');
        _animateInImage(this.el, img);
        setTimeout(function() {
            _animateOutElement(this.el, img);
            this._imageCount--;
            doneCb();
        }.bind(this), duration);
    }.bind(this);

    imgEl.src = url;
};

ScenePlayerElementManager.prototype.showText = function(text, duration, doneCb) {
    this._textCount++;
    var el = $('<p>' + text + '</p>');
    this.el.append(el);
    el.addClass('show-media-object');
    setTimeout(function() {
        _animateOutElement(this.el, el);
        this._textCount--;
        doneCb();
    }.bind(this), duration);
};

module.exports = function(element) {
    return new ScenePlayerElementManager(element);
};