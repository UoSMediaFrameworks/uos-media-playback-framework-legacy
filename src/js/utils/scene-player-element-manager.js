'use strict';
/*jshint browser:true */

var $ = require('jquery');
var getVimeoId = require('./get-vimeo-id');
var _ = require('lodash');
var EmbeddedVimeoPlayer = require('./embedded-vimeo-player');


function _animateInElement (parentEl, element) {
    parentEl.append(element);

    // random start position
    element.css({
        left: Math.random() * (parentEl.width() - element.width()),
        top: Math.random() * (parentEl.height() - element.height())
    });

    // and show - use defer to make sure callstack clears and image get's added to screen prior to adding class
    _.defer(function() {
        element.addClass('show-media-object');
    });
}



function _animateOutElement (element) {
    element.removeClass('show-media-object');
    window.setTimeout(function () {
        element.remove();
    }, 1400);
}



/**********************************************************\
  ScenePlayerElementManager 
\**********************************************************/

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
        img.addClass('image-media-object').addClass('media-object');
        _animateInElement(this.el, img);
        setTimeout(function() {
            _animateOutElement(img);
            this._imageCount--;
            doneCb();
        }.bind(this), duration);
    }.bind(this);

    imgEl.src = url;
};

ScenePlayerElementManager.prototype.showText = function(text, duration, doneCb) {
    this._textCount++;
    var el = $('<p class="media-object text-media-object">' + text + '</p>');
    _animateInElement(this.el, el);
    
    setTimeout(function() {
        _animateOutElement(el);
        this._textCount--;
        doneCb();
    }.bind(this), duration);
};

module.exports = function(element) {
    return new ScenePlayerElementManager(element);
};