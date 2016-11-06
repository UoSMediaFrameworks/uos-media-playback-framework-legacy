'use strict';
/*jshint browser: true */

var _ = require('lodash');
var hat = require('hat');
var Vimeo = require('@vimeo/player');

function urlAttrs(obj) {
    return _.chain(obj)
        .pairs()
        .map(function (v) {
            return v[0] + '=' + v[1].toString();
        })
        .join('&');
}
function checkDisplayRatio(id,playerUrl, width, height) {
    var iframeH, iframeW;

    //Scaling the window to 40% of the screen size
    iframeH = height * 0.40;
    iframeW = width * 0.40;
    //Tranforming it the video size to 16:9 ration
    if (width >= height) {
        iframeW = (iframeH * 16) / 9;
        return {height:iframeH,width:iframeW};
    } else {
        iframeH = (iframeW / 16) * 9;
        return {height:iframeH,width:iframeW};

    }
}

function makeElement(tagName, attributes) {
    var el = document.createElement(tagName);
    _.each(attributes, function (value, key) {
        el.setAttribute(key, value);
    });

    return el;
}


var players = {};
function registerPlayer(id, player) {
    players[id] = player;
}

function unregisterPlayer(id) {
    delete players[id];
}

function onMessageRecieved(event) {
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

function EmbeddedVimeoPlayer(isVimeo, videoUrl) {
    this._ready = false;
    this.id = hat();
    this.isVimeo = isVimeo;

    registerPlayer(this.id, this);

    if(isVimeo)
        this.setupAsVimeoPlayer(videoUrl);
    else
        this.setupAsRawPlayer(videoUrl);


    this.url = this._element.attributes.src.value.split('?')[0];

    document.body.appendChild(this._element);

    //https://github.com/vimeo/player.js
    if(isVimeo)
        this.vimeo_player = new Vimeo(this._element);
    else
        this.raw_player = this._element;

    return this;
}

EmbeddedVimeoPlayer.prototype.setupAsVimeoPlayer = function(vimeoId) {
    var urlAttrsStr = urlAttrs({
            api: 1,
            player_id: this.id,
            title: 0,
            autoplay: 0
        }),
        playerUrl = 'https://player.vimeo.com/video/' + vimeoId + '?' + urlAttrsStr;
    try {
        var dimensions = checkDisplayRatio(window.innerWidth, window.innerHeight);
        this._element = makeElement('iframe', {
            src: playerUrl,
            id: this.id,
            width: dimensions.width,
            height: dimensions.height,
            frameborder: 0,
            class: 'media-object embedded-vimeo-player'
        });
    }
    catch (e) {
        console.log(e)
    }
};

EmbeddedVimeoPlayer.prototype.setupAsRawPlayer = function(videoUrl) {
    this._element = makeElement('video', {
        src: videoUrl,
        id: this.id,
        class: 'media-object embedded-vimeo-player'
    });

    this._element.controls = true;
    this._element.autoplay = true;
    this._element.looping = true; //should be some logic
};

EmbeddedVimeoPlayer.prototype.postMessage = function (action, value) {
    var data = {
        method: action
    };

    if (value) {
        data.value = value;
    }

    var msg = JSON.stringify(data);

    console.log("postMessage: ", msg);

    this._element.contentWindow.postMessage(data, this.url);
};

EmbeddedVimeoPlayer.prototype.onPlayProgress = function (cb) {
    this._playProgressHandler = cb;
};


EmbeddedVimeoPlayer.prototype.onReady = function (cb) {
    this._readyHandler = cb;
};

EmbeddedVimeoPlayer.prototype.handleEvent = function (data) {
    switch (data.event) {
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

EmbeddedVimeoPlayer.prototype.remove = function () {
    unregisterPlayer(this.id);
};


module.exports = EmbeddedVimeoPlayer;
