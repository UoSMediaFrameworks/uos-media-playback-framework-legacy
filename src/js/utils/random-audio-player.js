'use strict';
/* jshint browser:true */

var _ = require('lodash');
var variableThrottle = require('./variable-throttle');
var AudioMediaObject = require('./media-object/audio-media-object');

module.exports = RandomAudioPlayer;

function RandomAudioPlayer (queue) {

    function moTransitionHandler (mo) {
        mo.removeListener('transition', moTransitionHandler);
        playAudio();
    }

    var playAudio = variableThrottle(function() {

        var obj = queue.take([AudioMediaObject]);
        if (obj) {
            obj.on('transition', moTransitionHandler);

            obj.play();
        }
    }, function() {
        return queue.displayInterval;
    });

    this.start = function() {
        playAudio();
        window.setInterval(playAudio, queue.displayInterval);
    };
}
