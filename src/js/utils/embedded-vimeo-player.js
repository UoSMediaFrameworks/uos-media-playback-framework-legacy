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
function addSourceToRawVideo(element, transcodedUrl, rawSourceInfo, videoInfo) {
    var source = document.createElement('source');
    if (videoInfo.data.hasTranscoded) {
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

    this.url = videoInfo.data.hasTranscoded ? transcodedUrl : videoUrl;

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

EmbeddedVimeoPlayer.prototype.setupAsRawPlayer = function (transcodedInfo, videoInfo) {
    var fallbackSource = videoUtils.getRawVideoDirectPlaybackSupport(videoInfo.data.video.url)
    if(!videoInfo.data.hasTranscoded && fallbackSource.type == "unsupported"){
        var div = document.createElement("div");
        div.innerHTML ="not supported"
        this._element = div;
    }else{
        this._element = makeElement('video', {
            id: this.id,
            class: ' embedded-vimeo-player',
            'data-dashjs-player': 'data-dashjs-player'
        });
        addSourceToRawVideo(this._element, transcodedInfo, fallbackSource, videoInfo);
        var dimensions = checkDisplayRatio(window.innerWidth, window.innerHeight);

        this._element.style.width = dimensions.width + 'px';
        this._element.style.height = dimensions.height + 'px';

        this._element.controls = false;
    }


};



EmbeddedVimeoPlayer.prototype.remove = function () {
    unregisterPlayer(this.id);
};


module.exports = EmbeddedVimeoPlayer;
