'use strict';
/*jshint browser:true */

var MediaObject = require('./media-object');
var inherits = require('inherits');

module.exports = StaticMediaObject;
inherits(StaticMediaObject, MediaObject);

function StaticMediaObject (obj, ops) {
    MediaObject.call(this, obj, ops);
}

StaticMediaObject.prototype.play = function(ops) {
    setTimeout(this.transition.bind(this), ops.displayDuration);
    this.element.style.transition = 'opacity ' + (ops.transitionDuration / 1000) + 's ease-in-out';
    MediaObject.prototype.play.call(this, ops);
};
