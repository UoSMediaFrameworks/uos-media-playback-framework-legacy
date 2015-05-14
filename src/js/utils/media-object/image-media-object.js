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

    this.element = el;

    callback();

};

ImageMediaObject.prototype.play = function() {
    setTimeout(this.transition.bind(this), this._ops.displayDuration);
    this.element.style.transition = 'opacity ' + (this._ops.transitionDuration / 1000) + 's ease-in-out';
    StaticMediaObject.prototype.play.call(this);
};

ImageMediaObject.prototype.transition = function() {
    if (this._playing) {
        this._playing = false;
        this.emit('transition', this);

        setTimeout(function() {
            this.emit('done', this);    
        }.bind(this), this._ops.transitionDuration);    
    }    
};

ImageMediaObject.prototype.onReady = function(callback) {
    var self = this;
    this.element.onload = function() {
        if (self._playing) {
            callback();
        }
    };    
    this.element.src = this._obj.url;
};
