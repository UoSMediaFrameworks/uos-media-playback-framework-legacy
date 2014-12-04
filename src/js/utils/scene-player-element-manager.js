'use strict';
/*jshint browser:true */

var $ = require('jquery');


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
    this.el = $(element);
    this._timeouts = [];
}

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