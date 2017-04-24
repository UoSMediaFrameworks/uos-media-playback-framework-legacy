/**
 * Created by aaronphillips on 23/04/2017.
 */

var assert = require('chai').assert;

var SceneSummariser = require('../src/js/utils/scene-summariser');


describe('SceneSummariserTests', function() {

    var sceneNoMedia = {
        name: "test scene",
        _id: "OBJECT_ID",
        _groupId: 0,
        scene: []
    };

    var sceneWith5TextMedia = {
        name: "test scene",
        _id: "OBJECT_ID",
        _groupId: 0,
        scene: [
            { _id: "OBJECT_ID", type: "text" },
            { _id: "OBJECT_ID", type: "text" },
            { _id: "OBJECT_ID", type: "text" },
            { _id: "OBJECT_ID", type: "text" },
            { _id: "OBJECT_ID", type: "text" }
        ]
    };

    var sceneWith8MixedMedia = {
        name: "test scene",
        _id: "OBJECT_ID",
        _groupId: 0,
        scene: [
            { _id: "OBJECT_ID", type: "text" },
            { _id: "OBJECT_ID", type: "text" },
            { _id: "OBJECT_ID", type: "video" },
            { _id: "OBJECT_ID", type: "image" },
            { _id: "OBJECT_ID", type: "image" },
            { _id: "OBJECT_ID", type: "image" },
            { _id: "OBJECT_ID", type: "audio" },
            { _id: "OBJECT_ID", type: "audio" }
        ]
    };

    var sceneWithNoPlaybackRulesSpecified = {
        name: "test scene",
        _id: "OBJECT_ID",
        _groupId: 0,
        scene: [
            { _id: "OBJECT_ID", type: "audio" },
            { _id: "OBJECT_ID", type: "audio" }
        ]
    };

    var sceneWithRandomAndLinearPlaybackRulesSpecified = {
        name: "test scene",
        _id: "OBJECT_ID",
        _groupId: 0,
        isLinearOptions: "playAllMedia",
        scene: [
            { _id: "OBJECT_ID", type: "audio" },
            { _id: "OBJECT_ID", type: "audio" }
        ]
    };

    var sceneWithLinearOnlyPlaybackRulesSpecified = {
        name: "test scene",
        _id: "OBJECT_ID",
        _groupId: 0,
        isLinearOptions: "playOnlySequencedMedia",
        scene: [
            { _id: "OBJECT_ID", type: "audio" },
            { _id: "OBJECT_ID", type: "audio" }
        ]
    };

    describe('summarise', function() {

        it('1. given a null scene, it will return a null summary', function() {
            var expectedResult = null;
            var actualResult = SceneSummariser.summarise(null);
            assert.equal(actualResult, expectedResult);
        });

        it('2. given a empty scene object, it will return a null summary', function() {
            var expectedResult = null;
            var actualResult = SceneSummariser.summarise({});
            assert.equal(actualResult, expectedResult);
        });

        it('3. given a scene with 0 media objects, it will return a basic summary', function() {
            var expectedSummary = {
                text: 0,
                video: 0,
                image: 0,
                audio: 0,
                playback: 0 // playback summary value specified between ( Random Only | Random and Linear | Linear Only )
            };
            var actualResult = SceneSummariser.summarise(sceneNoMedia);
            assert.deepEqual(actualResult, expectedSummary);
        });

        it('4. given a scene with 5 text media objects, the summary returned is correct', function(){
            var expectedSummary = {
                text: 5,
                video: 0,
                image: 0,
                audio: 0,
                playback: 0 // playback summary value specified between ( Random Only | Random and Linear | Linear Only )
            };
            var actualResult = SceneSummariser.summarise(sceneWith5TextMedia);
            assert.deepEqual(actualResult, expectedSummary);
        });

        it('5. given a scene with mixed media objects of all types, the summary returned is correct', function(){
            var expectedSummary = {
                text: 2,
                video: 1,
                image: 3,
                audio: 2,
                playback: 0 // playback summary value specified between ( Random Only | Random and Linear | Linear Only )
            };
            var actualResult = SceneSummariser.summarise(sceneWith8MixedMedia);
            assert.deepEqual(actualResult, expectedSummary);
        });

        it('6. given a scene without playback rules, a default playback value of 0 is in the summary', function() {
            var expectedSummary = {
                text: 0,
                video: 0,
                image: 0,
                audio: 2,
                playback: 0 // playback summary value specified between ( Random Only | Random and Linear | Linear Only )
            };
            var actualResult = SceneSummariser.summarise(sceneWithNoPlaybackRulesSpecified);
            assert.deepEqual(actualResult, expectedSummary);
        });

        it('7. given a scene with linear and random set for playback rules, a playback value of 1 is in the summary', function() {
            var expectedSummary = {
                text: 0,
                video: 0,
                image: 0,
                audio: 2,
                playback: 1 // playback summary value specified between ( Random Only | Random and Linear | Linear Only )
            };
            var actualResult = SceneSummariser.summarise(sceneWithRandomAndLinearPlaybackRulesSpecified);
            assert.deepEqual(actualResult, expectedSummary);
        });

        it('8. given a scene with linear for playback rules, a playback value of 2 is in the summary', function() {
            var expectedSummary = {
                text: 0,
                video: 0,
                image: 0,
                audio: 2,
                playback: 2 // playback summary value specified between ( Random Only | Random and Linear | Linear Only )
            };
            var actualResult = SceneSummariser.summarise(sceneWithLinearOnlyPlaybackRulesSpecified);
            assert.deepEqual(actualResult, expectedSummary);
        });
        
        // APEP TODO test with incorrectly written JSON

    });


});
