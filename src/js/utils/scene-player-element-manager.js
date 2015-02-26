'use strict';
/*jshint browser:true */

var $ = require('jquery');
var getVimeoId = require('./get-vimeo-id');
var _ = require('lodash');
var EmbeddedVimeoPlayer = require('./embedded-vimeo-player');



function ScenePlayerElementManager (element) {
    var $el = $(element);

    this._videoDoneCb = null;
    // total number of active items being displayed
    this._imageCount = 0;
    this._textCount = 0;
    this._staticTypeCounts = {};
    
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



function incrementStaticTypeCount (self, type) {
    if (self._staticTypeCounts[type]) {
        self._staticTypeCounts[type] += 1;
    } else {
        self._staticTypeCounts[type] = 1;
    }
}

function decrementStaticTypeCount (self, type) {
    self._staticTypeCounts[type] -= 1;
}

ScenePlayerElementManager.prototype.getStaticTypeCount = function(type) {
    return this._staticTypeCounts[type] || 0;
};

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

function showStaticElement (manager, element, type, duration, doneCb) {
    animateInElement(manager._el, element);
    setTimeout(function() {
        animateOutElement(element);
        decrementStaticTypeCount(manager, type);
        doneCb();
    }, duration);
}

ScenePlayerElementManager.prototype.showStaticType = function(type, value, duration, doneCb) {
    incrementStaticTypeCount(this, type);

    var element;
    switch(type) {
        case 'image':
            var imgEl = new Image();
            element = $(imgEl);
            element.addClass('image-media-object').addClass('media-object');
            imgEl.onload = function() {
                showStaticElement(this, element, type, duration, doneCb);   
            }.bind(this);
            imgEl.src = value;
            break;

        case 'text':
            element = $('<p class="media-object text-media-object">' + value + '</p>');
            showStaticElement(this, element, type, duration, doneCb);
            break;
    }
};


module.exports = function(element) {
    return new ScenePlayerElementManager(element);
};