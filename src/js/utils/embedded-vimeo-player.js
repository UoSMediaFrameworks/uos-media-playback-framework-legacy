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
function addSourceToRawVideo(element, transcodedUrl, rawSourceInfo, videoInfo) {
    var source = document.createElement('source');
    var fallbackSource = document.createElement('source');
    if (videoInfo.hasTranscoded) {
        source.src = transcodedUrl;
        source.type = "application/dash+xml";
        element.appendChild(source);
        addFallbackSource(fallbackSource,rawSourceInfo)
    }
    addFallbackSource(fallbackSource,rawSourceInfo)
    element.appendChild(fallbackSource);

}
function EmbeddedVimeoPlayer(isVimeo, videoUrl, videoInfo) {

    console.log("newEVP")

    this._ready = false;
    this.unsupported = false;
    this.id = hat();
    this.isVimeo = isVimeo;

    var transcodedUrl = videoUtils.getTranscodedUrl(videoUrl)
    registerPlayer(this.id, this);

    if (isVimeo) {
        this.setupAsVimeoPlayer(videoUrl);
        this.url = videoUrl;
    } else if (videoInfo) {
        console.log("non Vimeo", videoInfo)

        this.setupAsRawPlayer(transcodedUrl, videoInfo);
    } else {
        //Do something to clear this object from queue
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

    if (videoInfo)
        var fallbackSource = videoUtils.getRawVideoDirectPlaybackSupport(videoInfo.video.url)
    if (!videoInfo.hasTranscoded && fallbackSource.type == "unsupported") {
        this.unsupported = true;
        var video = makeElement("video", {
            id: this.id,
            class: ' embedded-vimeo-player not-supported',
        });
        video.innerHTML = "not supported";
        this._element = video;
        document.body.appendChild(this._element);

        video.load();
        this.raw_player = video;
        this.player_url = videoInfo.video.url;
        console.log("NonSupported", video, videoInfo.video.url)
    } else {
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
        if(videoInfo.hasTranscoded){
            var player = dashjs.MediaPlayer().create();
            player.getDebug().setLogToBrowserConsole(false);
            player.initialize(this._element, transcodedUrl, true);
            this.raw_player = player;
            this.player_url = transcodedUrl;
            this.transcoded = true;
        }else{
            this.raw_player = this._element;
            this.player_url =videoInfo.video.url
            this.transcoded = false;
        }


        console.log("getting transcoded url and initializing player",    this.raw_player, this.player_url)
    }

};


EmbeddedVimeoPlayer.prototype.remove = function () {
    unregisterPlayer(this.id);
};


module.exports = EmbeddedVimeoPlayer;
