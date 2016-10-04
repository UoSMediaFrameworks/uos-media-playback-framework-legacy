'use strict';
/*jshint browser: true */

var _ = require('lodash');
var hat = require('hat');

function urlAttrs (obj) {
    return _.chain(obj)
        .pairs()
        .map(function(v) { return v[0] + '=' + v[1].toString();})
        .join('&');
}

function makeElement(tagName, attributes) {
    var el = document.createElement(tagName);
    _.each(attributes, function(value, key) {
        el.setAttribute(key, value);
    });

    return el;
}



var players = {};
function registerPlayer (id, player) {
    players[id] = player;
}

function unregisterPlayer(id) {
    delete players[id];
}

function onMessageRecieved (event) {
    //APEP 3/10/16 - Chrome dev tools + react dev tools cause events to be sent to player 
    var data = JSON.parse(event.data);
    players[data.player_id].handleEvent(data);
}

// check for window, we won't have it if we are running headless tests
if (typeof window !== 'undefined') {
    if (window.addEventListener) {
        window.addEventListener('message', onMessageRecieved, false);
    } else {
        window.attachEvent('onmessage', onMessageRecieved, false);
    }
}

function EmbeddedVimeoPlayer (vimeoId) {
    this._ready = false;
    this.id = hat();

    registerPlayer(this.id, this);

    var urlAttrsStr = urlAttrs({
            api: 1,
            player_id: this.id,
            title: 0,
            autoplay: 0
        }),
        playerUrl = 'https://player.vimeo.com/video/' + vimeoId + '?' + urlAttrsStr;

    this._element = makeElement('iframe', {
        src: playerUrl,
        id: this.id,
        width: 640,
        height: 360,
        frameborder: 0,
        class: 'media-object embedded-vimeo-player'
    });

    document.body.appendChild(this._element);
    
    this.url = this._element.attributes.src.value.split('?')[0];
}

EmbeddedVimeoPlayer.prototype.postMessage = function(action, value) {
    var data = {
        method: action
    };

    if (value) {
        data.value = value;
    }

    var msg = JSON.stringify(data);
    
    this._element.contentWindow.postMessage(data, this.url);
};

EmbeddedVimeoPlayer.prototype.onPlayProgress = function(cb) {
    this._playProgressHandler = cb;
};


EmbeddedVimeoPlayer.prototype.onReady = function(cb) {
    this._readyHandler = cb;
};

EmbeddedVimeoPlayer.prototype.handleEvent = function(data) {
    switch(data.event) {
        case 'ready':
            this.postMessage('addEventListener', 'playProgress');
            if (this._readyHandler) {
                this._readyHandler(this._element);    
            }
            
            break;
        case 'playProgress':
            if (this._playProgressHandler) {
                this._playProgressHandler(data.data);    
            }
            break;
    }
};

EmbeddedVimeoPlayer.prototype.remove = function() {
    unregisterPlayer(this.id);
};


module.exports = EmbeddedVimeoPlayer;
