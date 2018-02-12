/**
 * Created by aaronphillips on 04/04/2017.
 */

var assert = require('chai').assert;
var SceneThemeTourBucketPermutations = require('../src/js/utils/playback/scene-theme-tour-bucket-permutations');

var sceneThemeTourBucketPermutations = new SceneThemeTourBucketPermutations();

describe('SceneThemeTourBucketPermutations', function () {

    var s1 = {
        "name": "s1",
        "themes": {
            "t1": "tag1, tag2",
            "t2": "tag2, tag3"
        }
    };

    var s2 = {
        "name": "s2",
        "themes": {
            "t1": "tag1, tag2",
            "t3": "tag3, tag4"
        }
    };

    var s3 = {
        "name": "s3",
        "themes": {
            "t1": "tag5, tag6"
        }
    };

    var s4 = {
        "name": 's4',
        "themes": {

        }
    };

    describe('generatePermutationsGivenScenesAndThemes', function() {

        var sceneAndThemesScenarioOne = {
            "scenes": [
                s1
            ],
            "themes": [
                "t1"
            ]
        };

        it('1. should return a single permutation - for a single scene with only one theme to be used', function() {

            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenScenesAndThemes(sceneAndThemesScenarioOne.scenes, sceneAndThemesScenarioOne.themes);

            var expectedNumberOfPermutations = 1;
            var expectedPermutation = {
                "scene": s1,
                "theme": "tag1, tag2"
            };

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.equal(permutations[0].scene, expectedPermutation.scene);
            assert.equal(permutations[0].theme, expectedPermutation.theme);
        });

        var sceneAndThemesScenarioTwo = {
            "scenes": [
                s1, s2
            ],
            "themes": [
                "t1"
            ]
        };

        it('2. should return two permutations, combining s1 and s2 with the same theme', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenScenesAndThemes(sceneAndThemesScenarioTwo.scenes, sceneAndThemesScenarioTwo.themes);

            var expectedNumberOfPermutations = 2;
            var expectedPermutations = [{
                "scene": s1,
                "theme": "tag1, tag2"
            },{
                "scene": s2,
                "theme": "tag1, tag2"
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);

        });

        var sceneAndThemesScenarioThree = {
            "scenes": [
                s1, s2, s3
            ],
            "themes": [
                "t1"
            ]
        };

        it('3. should return n permutations, for n scenes and 1 theme', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenScenesAndThemes(sceneAndThemesScenarioThree.scenes, sceneAndThemesScenarioThree.themes);

            var expectedNumberOfPermutations = sceneAndThemesScenarioThree.scenes.length;
            var expectedPermutations = [{
                "scene": s1,
                "theme": "tag1, tag2"
            },{
                "scene": s2,
                "theme": "tag1, tag2"
            },{
                "scene": s3,
                "theme": "tag5, tag6"
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);
        });

        var sceneAndThemesScenarioFour = {
            "scenes": [
                s1, s2, s3
            ],
            "themes": [
                "t3"
            ]
        };

        it('4. should return n permutations, for n scenes that include the 1 theme, ie step over scenes that are missing the theme', function(){
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenScenesAndThemes(sceneAndThemesScenarioFour.scenes, sceneAndThemesScenarioFour.themes);

            var expectedNumberOfPermutations = 1;

            var expectedPermutations = [{
                "scene": s2,
                "theme": "tag3, tag4"
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);
        });

        var sceneAndThemesScenarioFive = {
            "scenes": [
                s1, s2, s3
            ],
            "themes": [
                "t1", "t3"
            ]
        };

        it('5. should return n permutations, for n scenes that include n themes', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenScenesAndThemes(sceneAndThemesScenarioFive.scenes, sceneAndThemesScenarioFive.themes);

            var expectedNumberOfPermutations = 4;

            var expectedPermutations = [{
                "scene": s1,
                "theme": "tag1, tag2"
            },{
                "scene": s2,
                "theme": "tag1, tag2"
            },{
                "scene": s2,
                "theme": "tag3, tag4"
            },{
                "scene": s3,
                "theme": "tag5, tag6"
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);
        });

        var sceneAndThemesScenarioSix = {
            "scenes": [
                s1, s2, s3
            ],
            "themes": [
                "t1", "t2", "t3"
            ]
        };

        it('6. should return n permutations, for n scenes that include n themes', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenScenesAndThemes(sceneAndThemesScenarioSix.scenes, sceneAndThemesScenarioSix.themes);

            var expectedNumberOfPermutations = 5;

            var expectedPermutations = [{
                "scene": s1,
                "theme": "tag1, tag2"
            },{
                "scene": s1,
                "theme": "tag2, tag3"
            },{
                "scene": s2,
                "theme": "tag1, tag2"
            },{
                "scene": s2,
                "theme": "tag3, tag4"
            },{
                "scene": s3,
                "theme": "tag5, tag6"
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);
        });

        var sceneAndThemesScenarioSeven = {
            "scenes": [
                s1, s2, s3
            ],
            "themes": [
                "t4", "t5", "t8"
            ]
        };

        it('7. should return 0 permutations, where no theme given can be matched to the provided scene bucket', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenScenesAndThemes(sceneAndThemesScenarioSeven.scenes, sceneAndThemesScenarioSeven.themes);

            var expectedNumberOfPermutations = 0;

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);
        });

        var sceneAndThemesScenarioEight = {
            "scenes": [],
            "themes": []
        };

        it('8. should return 0 permutations, where no theme or scenes are given', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenScenesAndThemes(sceneAndThemesScenarioEight.scenes, sceneAndThemesScenarioEight.themes);

            var expectedNumberOfPermutations = 0;

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);
        });

    });

    describe('generatePermutationsGivenOnlyScenes', function() {

        var onlyScenesScenarioOne = {
            "scenes": [
                s1
            ],
            "themes": [
            ]
        };

        it('1. should generate N number of permutations for a single scene, where n is the number of themes in that scene', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenOnlyScenes(onlyScenesScenarioOne.scenes);

            var expectedNumberOfPermutations = 2;

            var expectedPermutations = [{
                "scene": s1,
                "theme": "tag1, tag2"
            },{
                "scene": s1,
                "theme": "tag2, tag3"
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);
        });

        var onlyScenesScenarioTwo = {
            "scenes": [
                s1, s2
            ],
            "themes": [

            ]
        };

        it('2. should generate N number of permutations for multiple scenes, where n is the number of themes in both scenes', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenOnlyScenes(onlyScenesScenarioTwo.scenes);

            var expectedNumberOfPermutations = 4;

            var expectedPermutations = [{
                "scene": s1,
                "theme": "tag1, tag2"
            },{
                "scene": s1,
                "theme": "tag2, tag3"
            },{
                "scene": s2,
                "theme": "tag1, tag2"
            },{
                "scene": s2,
                "theme": "tag3, tag4"
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);
        });

        var onlySceneScenarioThree = {
            "scenes": [
                s1, s2, s3
            ],
            "themes": [

            ]
        };

        it('3. should generate N number of permutations for multiple scenes, where n is the number of themes in all scenes', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenOnlyScenes(onlySceneScenarioThree.scenes);

            var expectedNumberOfPermutations = 5;

            var expectedPermutations = [{
                "scene": s1,
                "theme": "tag1, tag2"
            },{
                "scene": s1,
                "theme": "tag2, tag3"
            },{
                "scene": s2,
                "theme": "tag1, tag2"
            },{
                "scene": s2,
                "theme": "tag3, tag4"
            },{
                "scene": s3,
                "theme": "tag5, tag6"
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);
        });

        var onlySceneScenarioFour = {
            "scenes": [
                s1, s2, s3, s4
            ],
            "themes": [

            ]
        };

        it('4. should generate N number of permutations for multiple scenes, where n is the number of themes in all scenes inclusive of scenes without themes', function() {
            var permutations = sceneThemeTourBucketPermutations.generatePermutationsGivenOnlyScenes(onlySceneScenarioFour.scenes);

            var expectedNumberOfPermutations = 6;

            var expectedPermutations = [{
                "scene": s1,
                "theme": "tag1, tag2"
            },{
                "scene": s1,
                "theme": "tag2, tag3"
            },{
                "scene": s2,
                "theme": "tag1, tag2"
            },{
                "scene": s2,
                "theme": "tag3, tag4"
            },{
                "scene": s3,
                "theme": "tag5, tag6"
            },{
                "scene": s4,
                "theme": ""
            }];

            assert.strictEqual(permutations.length, expectedNumberOfPermutations);

            assert.deepEqual(expectedPermutations, permutations);
        });

    });

    describe('generateMergedScenesAndThemes', function() {
        describe('single scene and multiple themes', function() {
            it('merges theme tag list with default merge statement with no type specified', function() {
                var permutations = sceneThemeTourBucketPermutations.generateMergedScenesAndThemes([s1], ["t1", "t2"]);

                var expectedNumberOfPermutations = 1;

                var expectedPermutations = [{
                    "scene": s1,
                    "theme": "tag1, tag2 OR tag2, tag3"
                }];

                assert.strictEqual(permutations.length, expectedNumberOfPermutations);

                assert.deepEqual(expectedPermutations, permutations);
            });

            it('merges theme tag list with the specified merge type', function() {
                var permutations = sceneThemeTourBucketPermutations.generateMergedScenesAndThemes([s1], ["t1", "t2"], sceneThemeTourBucketPermutations.AND_MERGE);

                var expectedNumberOfPermutations = 1;

                var expectedPermutations = [{
                    "scene": s1,
                    "theme": "tag1, tag2 AND tag2, tag3"
                }];

                assert.strictEqual(permutations.length, expectedNumberOfPermutations);

                assert.deepEqual(expectedPermutations, permutations);
            });

            it('ignore theme keys which are not declared in the scene', function() {
                var permutations = sceneThemeTourBucketPermutations.generateMergedScenesAndThemes([s1], ["t1", "t3"]);

                var expectedNumberOfPermutations = 1;

                var expectedPermutations = [{
                    "scene": s1,
                    "theme": "tag1, tag2"
                }];

                assert.strictEqual(permutations.length, expectedNumberOfPermutations);

                assert.deepEqual(expectedPermutations, permutations);
            });
        });

        describe('multiple scenes and themes', function() {
            it('for each scene, produces a single permutation with merged tag lists from theme keys when declared per scene', function() {
                var permutations = sceneThemeTourBucketPermutations.generateMergedScenesAndThemes([s1, s2], ["t1", "t3"]);

                var expectedPermutations = [{
                    "scene": s1,
                    "theme": "tag1, tag2"
                }, {
                    "scene": s2,
                    "theme": "tag1, tag2 OR tag3, tag4"
                }];

                assert.strictEqual(permutations.length, expectedPermutations.length);

                assert.deepEqual(expectedPermutations, permutations);
            });
        });
    });
});
