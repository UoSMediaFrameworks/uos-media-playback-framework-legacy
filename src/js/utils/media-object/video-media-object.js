'use strict';
/*jshint browser:true */

var TemporalMediaObject = require('./temporal-media-object');
var EmbeddedVimeoPlayer = require('../embedded-vimeo-player');
var getVimeoId = require('../get-vimeo-id');

function VideoMediaObject (obj) {
    TemporalMediaObject.call(this, obj);
}

VideoMediaObject.prototype = Object.create(TemporalMediaObject.prototype);
VideoMediaObject.prototype.constructor = VideoMediaObject;

VideoMediaObject.prototype.makeElement = function(callback) {
    var player = new EmbeddedVimeoPlayer(getVimeoId(this._obj.url));
    
    player.onReady(function() {
        //$(player.element).addClass('show-media-object');
        callback(player.element);
    }.bind(this));

    // we have to append it to the DOM, otherwise the loading won't take place
    // make sure the player is hidden by default
    document.body.appendChild(player.element);

    this._player = player;
    /*
    player.onFinish(function() {
        $(player.element).removeClass('show-media-object');
        window.setTimeout(function() {
            this._el[0].removeChild(player.element);
            doneCb();
        }.bind(this), 1000);
        
    }.bind(this));
    
    this._el.append(player.element);
    */
};

VideoMediaObject.prototype.play = function() {
    this._player.postMessage('play');
};

VideoMediaObject.prototype.onReady = function(callback) {
    this._player.onReady(callback);
};

VideoMediaObject.prototype.onFinish = function(callback) {
    this._player.onFinish(callback);
};

module.exports = VideoMediaObject;