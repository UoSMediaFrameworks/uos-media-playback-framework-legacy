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

function addFallbackSource(source, rawSourceInfo) {
    source.src = rawSourceInfo.url;
    source.type = rawSourceInfo.type;

    return source;
}

function addSourceToRawVideo(videoElement, transcodedUrl, rawSourceInfo, videoInfo) {

    // APEP if the video is transcoded we add it as the first source
    if (videoInfo.hasTranscoded) {
        var source = document.createElement('source');
        source.src = transcodedUrl;
        source.type = "application/dash+xml";
        videoElement.appendChild(source);
    }

    // APEP if the video type is not unsupported we will add a fallback source as second
    if(rawSourceInfo.type !== "unsupported") {
        var fallbackSource = document.createElement('source');
        addFallbackSource(fallbackSource, rawSourceInfo);
        videoElement.appendChild(fallbackSource);
    }

}

function EmbeddedVimeoPlayer(isVimeo, videoUrl, videoInfo) {

    this._ready = false;
    this.unsupported = false;
    this.id = hat();
    this.isVimeo = isVimeo;

    registerPlayer(this.id, this);

    if (isVimeo) {
        this.setupAsVimeoPlayer(videoUrl);
        this.url = videoUrl;
    } else if (videoInfo) {
        var transcodedUrl = videoUtils.getTranscodedUrl(videoUrl);
        this.setupAsRawPlayer(transcodedUrl, videoInfo);
    }

    return this;
}

EmbeddedVimeoPlayer.prototype.setupAsVimeoPlayer = function (vimeoId) {
    //https://github.com/vimeo/player.js
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
    document.body.appendChild(this._element);
    this.vimeo_player = new Vimeo(this._element);
};

EmbeddedVimeoPlayer.prototype.setupAsRawPlayer = function (transcodedUrl, videoInfo) {
    try {
        var fallbackSource = videoUtils.getRawVideoDirectPlaybackSupport(videoInfo.video.url);
        console.log(fallbackSource)
    } catch(e){
        console.log("Embedded-Visual-Player - RawPlayerFailure", e)
    }

    if (!videoInfo.hasTranscoded && fallbackSource.type == "unsupported") {
        // APEP For Videos that have not transcoded yet, and are not support for standard html5 playback
        // Mark as unsupported and create an empty video html 5 object
        console.log("NonSupported", videoInfo.video.url);
        this.unsupported = true;
        var video = makeElement("video", {
            id: this.id,
            class: ' embedded-vimeo-player not-supported'
        });
        video.innerHTML = "not supported";
        this._element = video;
        document.body.appendChild(this._element);
        this.raw_player = video;
        this.player_url = videoInfo.video.url;
    } else {
        this.unsupported = false;
        console.log("Embedded-Visual-Player - setupAsRawPlayer - hasVideoTranscoded: ", videoInfo.hasTranscoded);
        this._element = makeElement('video', {
            id: this.id,
            class: ' embedded-vimeo-player',
            'data-dashjs-player': 'data-dashjs-player'
        });
        addSourceToRawVideo(this._element, transcodedUrl, fallbackSource, videoInfo);
        var dimensions = checkDisplayRatio(window.innerWidth, window.innerHeight);

        this._element.style.width = dimensions.width + 'px';
        this._element.style.height = dimensions.height + 'px';
        this._element.controls = false;

        document.body.appendChild(this._element);
        if (videoInfo.hasTranscoded) {
            var player = dashjs.MediaPlayer().create();
            player.getDebug().setLogToBrowserConsole(false);
            player.initialize(this._element, transcodedUrl, true);
            this.raw_player = player;
            this.player_url = transcodedUrl;
            this.transcoded = true;
        } else {
            this.raw_player = this._element;
            this.player_url = videoInfo.video.url;
            this.transcoded = false;
        }

        console.log("Embedded-Visual-Player - getting transcoded url and initializing player", this.raw_player, this.player_url)
    }

};


EmbeddedVimeoPlayer.prototype.remove = function () {
    unregisterPlayer(this.id);
};


module.exports = EmbeddedVimeoPlayer;
