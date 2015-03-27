'use strict';

var _ = require('lodash');
var TagMatcher = require('./tag-matcher');

function RandomAudioPlayer (queue) {
    var activeAudio = [];

    function stopAudio(obj) {
        obj.stop();
        activeAudio.splice(activeAudio.indexOf(obj), 1);
    }

    function playAudio () {
            if (activeAudio.length < queue.maximumTypeCounts.audio) {
                var obj = queue.nextByType('audio');

                if (obj) {
                    activeAudio.push(obj);
                    obj.play(function() {
                        stopAudio(obj);
                        playAudio();
                    });  
                }

                setTimeout(function() {
                    playAudio();
                }, queue.displayInterval);
            }
        }

    this.start = playAudio;

    this.setTagMatcher = function(tagMatcher) {
        // verify that all currently playing audio tracks match the tagMatcher,
        // if not cancel them and start new ones
        var obs = _(activeAudio)
            .filter(function(obj) { return ! tagMatcher.match(obj.tags); })
            .forEach(stopAudio);

        playAudio();
    };
}

module.exports = RandomAudioPlayer;