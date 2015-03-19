'use strict';

function MediaObject (obj) {
    this._obj = obj;
}

MediaObject.prototype.play = function(parent, doneCb) {
    throw 'Not implemented!';
};

MediaObject.prototype.stop = function() {
    throw 'not implemented!';
};

module.exports = MediaObject;