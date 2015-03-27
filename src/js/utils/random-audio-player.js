'use strict';

function RandomAudioPlayer (queue) {
    var playingCount = 0;

    this.start = function playAudio () {
        if (playingCount < queue.maximumTypeCounts.audio) {
            var obj = queue.nextByType('audio');

            if (obj) {
                playingCount++;
                obj.play(function() {
                    playingCount--;
                    playAudio();
                });  
            }

            setTimeout(function() {
                playAudio();
            }, queue.displayInterval);
        }
    };
}

module.exports = RandomAudioPlayer;