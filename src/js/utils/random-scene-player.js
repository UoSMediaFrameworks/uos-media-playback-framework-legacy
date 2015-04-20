'use strict';

var _ = require('lodash');
var MediaObjectQueue = require('./media-object/media-object-queue');
var TextMediaObject = require('./media-object/text-media-object');
var ImageMediaObject = require('./media-object/image-media-object');
var VideoMediaObject = require('./media-object/video-media-object');
var AudioMediaObject = require('./media-object/audio-media-object');
var RandomVisualPlayer = require('./random-visual-player');
var RandomAudioPlayer = require('./random-audio-player');


function RandomScenePlayer (element) {
    var scenes,
        queue = new MediaObjectQueue(
            [TextMediaObject, AudioMediaObject, VideoMediaObject, ImageMediaObject],
            {image: 3, text: 1, video: 1, audio: 1}
        ),
        randomVisualPlayer = new RandomVisualPlayer(element, this.mediaObjectQueue),
        randomAudioPlayer = new RandomAudioPlayer(this.mediaObjectQueue);

    this.setScenes = function(newScenes) {
        var list = _.shuffle(newScenes);

        
    };
}

module.exports = RandomScenePlayer;