'use strict';

var _ = require('lodash');
var TagMatcher = require('./tag-matcher');

function RandomAudioPlayer (queue) {
    var activeAudio = [],
        tagMatcher = new TagMatcher('');

    function cleanupAudio(obj) {
        queue.give(obj);
        activeAudio.splice(activeAudio.indexOf(obj), 1);
    }

    function delayedPlayAudio () {
        setTimeout(function() {
            playAudio();
        }, queue.displayInterval * 1000);
    }

    function playAudio () {
            if (activeAudio.length < queue.maximumTypeCounts.audio) {
                var obj = queue.take('audio', tagMatcher);

                if (obj) {
                    activeAudio.push(obj);
                    obj.play(function(err) {
                        
                        cleanupAudio(obj);

                        // wait a little bit after we get an error until we try and play something else
                        // don't want to create a flood of error messages if we keep retryin the same file
                        if (err) {
                            console.log(err.toString());
                            delayedPlayAudio();
                        } else {
                            playAudio();    
                        }
                    });  

                    delayedPlayAudio();
                }

                
            }
        }

    this.start = playAudio;

    this.setTagMatcher = function(newTagMatcher) {
        // verify that all currently playing audio tracks match the tagMatcher,
        // if not cancel them and start new ones
        if (! tagMatcher.equalTo(newTagMatcher) ) {
            tagMatcher = newTagMatcher;
            _(activeAudio)
                .filter(function(obj) { return ! tagMatcher.match(obj.tags); })
                .forEach(function(obj) {
                    obj.stop(queue.transitionDuration);
                    cleanupAudio(obj);
                });

            playAudio();
        }
    };
}

module.exports = RandomAudioPlayer;