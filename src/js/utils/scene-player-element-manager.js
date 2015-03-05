'use strict';
/*jshint browser:true */

var $ = require('jquery');
var getVimeoId = require('./get-vimeo-id');
var _ = require('lodash');
var EmbeddedVimeoPlayer = require('./embedded-vimeo-player');

function ScenePlayerElementManager (element) {
    var $el = $(element);

    this._videoDoneCb = null;
    
    
    this._el = $('<div class="media-object-wrapper"></div>');
    $el.append(this._el);
    $el.append(this.videoPlayerEl);
}

function animateInElement (parentEl, element) {
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

function animateOutElement (element) {
    element.removeClass('show-media-object');
    window.setTimeout(function () {
        element.remove();
    }, 1400);
}

function showStaticElement (manager, element, type, duration, doneCb) {
    animateInElement(manager._el, element);
    setTimeout(function() {
        animateOutElement(element);
        doneCb();
    }, duration);
}

ScenePlayerElementManager.prototype.showVideo = function(vimeoUrl, doneCb) {
    var player = new EmbeddedVimeoPlayer(getVimeoId(vimeoUrl));
    
    player.onReady(function() {
        $(player.element).addClass('show-media-object');
    }.bind(this));

    player.onFinish(function() {
        $(player.element).removeClass('show-media-object');
        window.setTimeout(function() {
            this._el[0].removeChild(player.element);
            doneCb();
        }.bind(this), 1000);
        
    }.bind(this));
    
    this._el.append(player.element);
};

ScenePlayerElementManager.prototype.showImage = function(url, duration, doneCb) {
    var imgEl = new Image();
    var element = $(imgEl);
    element.addClass('image-media-object').addClass('media-object');
    imgEl.onload = function() {
        showStaticElement(this, element, 'image', duration, doneCb);   
    }.bind(this);
    imgEl.src = url;
};

ScenePlayerElementManager.prototype.showText = function(text, duration, doneCb) {
    var element = $('<p class="media-object text-media-object">' + text + '</p>');
    showStaticElement(this, element, 'text', duration, doneCb); 
};


module.exports = function(element) {
    return new ScenePlayerElementManager(element);
};