'use strict';
/*jshint browser:true */

var AtemporalMediaObject = require('./atemporal-media-object');

function ImageMediaObject (obj) {
    AtemporalMediaObject.call(this, obj);
}

ImageMediaObject.prototype = Object.create(AtemporalMediaObject.prototype);
ImageMediaObject.prototype.constructor = ImageMediaObject;

ImageMediaObject.typeName = 'image';

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