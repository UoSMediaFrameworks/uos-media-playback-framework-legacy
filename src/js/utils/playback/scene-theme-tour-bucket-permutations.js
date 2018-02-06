/**
 * Created by aaronphillips on 04/04/2017.
 */
var _ = require('lodash');

function SceneThemeTourBucketPermutations() {

    this.generateOnlyScenes = function(scenes) {

        var permutations = [];

        _.forEach(scenes, function(scene) {
            permutations.push({
                "scene": scene,
                "theme": ""
            });
        });

        // APEP TODO we can probably just replace this with a single lodash map function due to testing time, opted to leave for now.

        return permutations;
    };

    this.generatePermutationsGivenOnlyScenes = function(scenes) {

        var permutations = [];

        _.forEach(scenes, function(scene) {

            // APEP TODO write unit test for this hack
            if(!scene.themes)
                scene.themes = {};

            var sceneThemes = Object.keys(scene.themes);

            // APEP TODO we should provide a notification to the debug panel of the player in this case
            // APEP if the scene is missing any themes, we can't expand so provide empty theme for match all case
            if(sceneThemes.length === 0) {
                permutations.push({
                    "scene": scene,
                    "theme": ""
                });
            }

            _.forEach(sceneThemes, function(theme){
                permutations.push({
                    "scene": scene,
                    "theme": theme
                });
            });
        });

        // console.log("SceneThemeTourBucketPermutations - generatePermutationsGivenOnlyScenes - permutations: ", permutations);

        return permutations;
    };

    this.generatePermutationsGivenScenesAndThemes = function(scenes, themes) {

        var permutations = [];

        // APEP for each scene given
        _.forEach(scenes, function(scene) {

            // APEP TODO write unit test for this hack
            if(!scene.themes)
                scene.themes = {};

            // APEP pull the themes from the scene ready to check the given themes against this list
            var sceneThemes = Object.keys(scene.themes);

            // APEP TODO, if we don't match anything and skip a scene, we should provide a notification to the debug panel of the player

            // APEP for all the given themes for playback, if the scene has that theme, add a permutation
            _.forEach(themes, function(theme) {

                // APEP the scene contains the theme for playback, so include a permutation for this
                if(sceneThemes.indexOf(theme) !== -1) {
                    permutations.push({
                        "scene": scene,
                        "theme": theme
                    });
                }
            });
        });

        // console.log("SceneThemeTourBucketPermutations - generatePermutationsGivenScenesAndThemes - permutations: ", permutations);

        return permutations;
    };

}

module.exports = SceneThemeTourBucketPermutations;
