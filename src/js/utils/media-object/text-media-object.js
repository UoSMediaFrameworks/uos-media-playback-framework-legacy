'use strict';
/*jshint browser:true */

var StaticMediaObject = require('./static-media-object');
var inherits = require('inherits');

module.exports = TextMediaObject;
inherits(TextMediaObject, StaticMediaObject);


function TextMediaObject (obj, ops) {
    StaticMediaObject.call(this, obj, ops);
}

TextMediaObject.typeName = 'text';

// trigger callback with preloaded element
TextMediaObject.prototype.makeElement = function(callback) {
    var el = document.createElement('p');

    el.innerText = this._obj.text;
    el.classList.add('text-media-object', 'media-object');
    this.element = el;
    
    callback(el);
};

TextMediaObject.prototype.onReady = function(callback) {
	// it's always ready!
	callback();
};

module.exports = TextMediaObject;