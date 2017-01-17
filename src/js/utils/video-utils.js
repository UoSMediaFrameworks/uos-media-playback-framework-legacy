/**
 * Created by Angel on 15/01/2017.
 * Purpose to have all shared video media object based functionality
 * within a utility script
 */
'use strict';

var VideoUtils = {
    getTranscodedUrl: function (mediaObjectUrl) {
        var dashUrl = mediaObjectUrl.replace("raw", "transcoded/dash");

        var trailingSlash = dashUrl.lastIndexOf("/");
        dashUrl = dashUrl.substring(0, trailingSlash);
        dashUrl += '/video_manifest.mpd';

        return dashUrl;
    },

    getRawVideoDirectPlaybackSupport: function (mediaObjectUrl) {
        //Web M is supported as well but we are having some issues with it.
        var supportedVideoFallback = ["ogv", "mp4"];
        var extension = mediaObjectUrl.substr(mediaObjectUrl.lastIndexOf('.') + 1);
        var type = "unsupported";
        if (supportedVideoFallback.indexOf(extension) != -1) {
            if(extension =="ogv"){
                extension = "ogg";
            }
            type = "video/" + extension;
        }
        return {url: mediaObjectUrl, type: type}
    },
    getExtensionCodecs: function (extension) {
        var codex = null;
        switch (extension) {
            case "webm":
                codex = 'codecs="vp8.0, vorbis"';
                break;
            case "ogv":
                codex = 'codecs="theora, vorbis"';
                break;
            case "mp4":
                codex = 'codecs="avc1.4D401E, mp4a.40.2"';
                break;
        }
        return codex;
    }
};

module.exports = VideoUtils;
