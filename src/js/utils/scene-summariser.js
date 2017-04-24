/**
 * Created by aaronphillips on 23/04/2017.
 */

"use strict";

var _ = require('lodash');

var SceneSummariser = {

    // APEP summarise a scene to provide details such as
    // Number of each type of media object, linear playback rules, etc
    // playback (int) : playback summary value specified between ( Random Only | Random and Linear | Linear Only )
    summarise: function(scene) {

        if(!scene || Object.keys(scene).length === 0)
            return null;

        var textMediaObjectCount = _.countBy(scene.scene, function(mo) {
            return mo.type === "text"
        });

        var videoMediaObjectCount = _.countBy(scene.scene, function(mo) {
            return mo.type === "video"
        });

        var imageMediaObjectCount = _.countBy(scene.scene, function(mo) {
            return mo.type === "image"
        });

        var audioMediaObjectCount = _.countBy(scene.scene, function(mo) {
            return mo.type === "audio"
        });

        // APEP isLinearOption
        // APEP Missing Property = FULL RANDOM
        // APEP playRemainingMedia, playAllMedia = LINEAR AND RANDOM
        // APEP playOnlySequencedMedia = LINEAR ONLY

        // APEP default value
        var playbackRule = 0;

        var hasIsLinearOptions = scene.hasOwnProperty("isLinearOptions");

        if(hasIsLinearOptions) {

            var isLinearOnly = scene.isLinearOptions === "playOnlySequencedMedia";

            // APEP TODO handle invalid isLinearOptions values - currently only checks if playOnlySequencedMedia
            if(isLinearOnly) {
                playbackRule = 2;
            } else {
                playbackRule = 1;
            }

        }

        var summary = {
            text:  textMediaObjectCount.true  || 0,
            video: videoMediaObjectCount.true || 0,
            image: imageMediaObjectCount.true || 0,
            audio: audioMediaObjectCount.true || 0,
            playback: playbackRule // playback summary value specified between ( Random Only | Random and Linear | Linear Only )
        };

        return summary;
    }

};


module.exports = SceneSummariser;
