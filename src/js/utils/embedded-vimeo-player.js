'use strict';
/*jshint browser: true */

var _ = require('lodash');
var hat = require('hat');
var videoUtils = require('../utils/video-utils');
var Vimeo = require('@vimeo/player');


function urlAttrs(obj) {
    return _.chain(obj)
        .pairs()
        .map(function (v) {
            return v[0] + '=' + v[1].toString();
        })
        .join('&');
}
function checkDisplayRatio(width, height) {
    var iframeH, iframeW;

    //Scaling the window to 40% of the screen size
    iframeH = height * 0.40;
    iframeW = width * 0.40;
    //Tranforming it the video size to 16:9 ration
    if (width >= height) {
        iframeW = (iframeH * 16) / 9;
        return {height: iframeH, width: iframeW};
    } else {
        iframeH = (iframeW / 16) * 9;
        return {height: iframeH, width: iframeW};
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

function onMessageRecieved(evt) {
    //Hey its an angel test
    if(evt.origin != "https://player.vimeo.com"){
        console.log("onMessageRecieved",evt,typeof evt.data == "string");
    }


    //APEP 3/10/16 - Chrome dev tools + react dev tools cause events to be sent to player
    if (typeof evt.data == "string") {
        var data = JSON.parse(evt.data);
        players[data.player_id].handleEvent(data);
    } else {
        players[evt.data.player_id].handleEvent(evt);
    }
}

// check for window, we won't have it if we are running headless tests
if (typeof window !== 'undefined') {
    if (window.addEventListener) {
        window.addEventListener('message', onMessageRecieved, false);
    } else {
        window.attachEvent('onmessage', onMessageRecieved, false);
    }
}
function addSourceToRawVideo(element, transcodedUrl, rawSourceInfo, videoInfo) {
    var source = document.createElement('source');
    if (videoInfo.data.isTranscoded) {
        source.src = transcodedUrl;
        source.type = "application/dash+xml";
    } else {
        source.src = rawSourceInfo.url;
        source.type = rawSourceInfo.type;
    }
    element.appendChild(source);
}
function EmbeddedVimeoPlayer(isVimeo, videoUrl, videoInfo) {
    this._ready = false;
    this.id = hat();
    this.isVimeo = isVimeo;

    var transcodedUrl = videoUtils.getTranscodedUrl(videoUrl)
    registerPlayer(this.id, this);

    if (isVimeo)
        this.setupAsVimeoPlayer(videoUrl);
    else
        this.setupAsRawPlayer(transcodedUrl, videoInfo);

    this.url = videoInfo.data.isTranscoded ? transcodedUrl : videoUrl;

    this.url = this._element.attributes.src.value.split('?')[0];
    document.body.appendChild(this._element);
    //https://github.com/vimeo/player.js
    if (isVimeo) {
        this.vimeo_player = new Vimeo(this._element);
    } else {

        //var url = "Transcoding_3/video_manifest.mpd"; //APEP see other comment (_getRawPlayerForMediaObject)
        var player = dashjs.MediaPlayer().create();
        player.getDebug().setLogToBrowserConsole(false);
        player.initialize(this._element, transcodedUrl, true);
        this.raw_player = player;
        this.player_url = transcodedUrl;
        console.log("getting transcoded url and initializing player", player, transcodedUrl)
    }

    return this;
}

EmbeddedVimeoPlayer.prototype.setupAsVimeoPlayer = function (vimeoId) {
    var urlAttrsStr = urlAttrs({
            player_id: this.id,
            title: 0,
            autoplay: 0,
            autopause: 0
        }),
        playerUrl = 'https://player.vimeo.com/video/' + vimeoId + '?' + urlAttrsStr;

    var dimensions = checkDisplayRatio(window.innerWidth, window.innerHeight);
    this._element = makeElement('iframe', {
        id: this.id,
        width: dimensions.width,
        height: dimensions.height,
        src: playerUrl,
        frameborder: 0,
        class: ' embedded-vimeo-player'
    });


};

EmbeddedVimeoPlayer.prototype.setupAsRawPlayer = function (videoUrl, videoInfo) {
    var fallbackSource = videoUtils.getRawVideoDirectPlaybackSupport(videoUrl)
    if (fallbackSource.type !== "unsupported") {
        this._element = makeElement('video', {
            id: this.id,
            class: ' embedded-vimeo-player',
            'data-dashjs-player': 'data-dashjs-player'
        });
        addSourceToRawVideo(this._element, videoUrl, fallbackSource, videoInfo);
        var dimensions = checkDisplayRatio(window.innerWidth, window.innerHeight);

        this._element.style.width = dimensions.width + 'px';
        this._element.style.height = dimensions.height + 'px';

        this._element.controls = false;
    } else {
        var div =  document.createElement('div');
        div.innerHTML = "Not supported";
        this._element = div;
    }

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
