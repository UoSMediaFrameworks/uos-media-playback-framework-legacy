'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');

function ImageMediaObject (obj) {
    MediaObject.call(this, obj);
}

ImageMediaObject.prototype = Object.create(MediaObject.prototype);
ImageMediaObject.prototype.constructor = ImageMediaObject;

// trigger callback with preloaded element
ImageMediaObject.prototype.makeElement = function(callback) {
    var el = new Image();

    el.classList.add('image-media-object', 'media-object');
    
    el.onload = function() {
        callback(el);
    };

    el.src = this._obj.url;
};

module.exports = ImageMediaObject;