'use strict';
/*jshint browser:true */

var StaticMediaObject = require('./static-media-object');
var inherits = require('inherits');

module.exports = ImageMediaObject;
inherits(ImageMediaObject, StaticMediaObject);

function ImageMediaObject (obj, ops) {
    StaticMediaObject.call(this, obj, ops);
}

ImageMediaObject.typeName = 'image';

// trigger callback with preloaded element
ImageMediaObject.prototype.makeElement = function(callback) {
    var el = new Image();
    
    el.classList.add('image-media-object', 'media-object');

    el.src = this._obj.url;

    this.element = el;

    callback();

};

ImageMediaObject.prototype.play = function(ops) {
    setTimeout(this.transition.bind(this), ops.displayDuration);
    this.element.style.transition = 'opacity ' + (ops.transitionDuration / 1000) + 's ease-in-out';
    StaticMediaObject.prototype.play.call(this, ops);
};

ImageMediaObject.prototype.onReady = function(callback) {
    if (this.element.complete) {
        callback();
    } else {
        this.element.onload = callback;    
    }
};
