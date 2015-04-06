'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');
var inherits = require('inherits');

module.exports = ImageMediaObject;
inherits(ImageMediaObject, MediaObject);

function ImageMediaObject (obj, ops) {
    MediaObject.call(this, obj, ops);
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

ImageMediaObject.prototype.onReady = function(callback) {
    if (this.element.complete) {
        callback();
    } else {
        this.element.onload = callback;    
    }
};
