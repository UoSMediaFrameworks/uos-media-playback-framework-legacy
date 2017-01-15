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
        var supportedVideoFallback = ["ogv", "ogg", "mp4", "webm"];
        var extension = mediaObjectUrl.substr(mediaObjectUrl.lastIndexOf('.') + 1);
        var type = "unsupported";
        if (supportedVideoFallback.indexOf(extension) != -1) {
            type = "video/" + extension;
        }
        return {url: mediaObjectUrl, type: type}
    }
}

module.exports = VideoUtils;
