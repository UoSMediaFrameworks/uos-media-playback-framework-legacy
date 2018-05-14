'use strict';

// APEP capital cases are also provided.  Apple devices tend to provide uppercase file extensions and this conflicts with a known bug
// APEP See : https://github.com/Artear/ReactResumableJS/issues/20
var imageFileTypes = ["png", "PNG", "jpg", "JPG","JPEG","jpeg", "webp", "WEBP", "gif", "GIF", "svg", "SVG"];
var videoFileTypes = ["mov", "MOV", 'mp4', "MP4", "webm", "WEBM", "flv", "FLV", "wmv", "WMV", "avi", "AVI",
    "ogg", "OGG", "ogv", "OGV", "qt", "QT", "asf", "ASF", "mpg", "MPG", "3gp", "3GP"];
var audioFileTypes = ["mp3", "MP3", "wav", "WAV"];

var allFileTypes = imageFileTypes.concat(videoFileTypes);
allFileTypes = allFileTypes.concat(audioFileTypes);

module.exports = {
    IMAGE_FILE_TYPES: imageFileTypes,
    VIDEO_FILE_TYPES: videoFileTypes,
    AUDIO_FILE_TYPES: audioFileTypes,
    ALL_FILE_TYPES: allFileTypes
};
