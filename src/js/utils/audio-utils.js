/**
 * Created by AAA48574 on 26/07/2017.
 */
'use strict';

var AudioUtils = {
    getTranscodedUrl: function(mediaObjectUrl) {
        var mp3Url = mediaObjectUrl.replace("raw", "transcoded/mp3");

        var trailingSlash = mp3Url.lastIndexOf("/");
        mp3Url = mp3Url.substring(0, trailingSlash);
        mp3Url += '/audio_320k.mp3';

        return mp3Url;
    }
};

module.exports = AudioUtils;
