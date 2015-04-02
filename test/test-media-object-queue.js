'use strict';

var _ = require('lodash');
_.mixin(require('lodash-deep'));
var MediaObjectQueue = require('../src/js/utils/media-object/media-object-queue');
var assert = require('chai').assert;
var chance = require('chance').Chance();
var ImageMediaObject = require('../src/js/utils/media-object/image-media-object');
var VideoMediaObject = require('../src/js/utils/media-object/video-media-object');
var TextMediaObject = require('../src/js/utils/media-object/text-media-object');
var AudioMediaObject = require('../src/js/utils/media-object/audio-media-object');
var TagMatcher = require('../src/js/utils/tag-matcher');


function makeScene (ops) {
    var scene = [];

    if (ops) {
        ['image', 'video', 'audio'].forEach(function(type) {
            for (var i = 0; i < ops[type] || 0; i++) {
                scene.push({
                    type: type,
                    url: chance.url()
                });
            }    
        });

        for (var i = 0; i < ops.text || 0; i++) {
            scene.push({
                type: 'text',
                text: chance.string()
            });
        }
    }
    
    
    return {
        name: chance.string(),
        _id: chance.string(),
        themes: {},
        scene: scene
    };
}

function moWithTags (type, tags) {
    return {
        type: type,
        url: chance.string(),
        tags: tags
    };
}


describe('MediaObjectQueue', function () {
    beforeEach(function () {
        this.queue = new MediaObjectQueue();
    });

    var emptyMatch = new TagMatcher('');

    describe('take/return behavior', function () {
        beforeEach(function () {
            this.queue.setScene(makeScene({image: 1, video: 1, text: 1, audio: 1}));
        });

        describe('take(type)', function () {
            it('should return an object of type if one is available', function () {
                assert.instanceOf(this.queue.take('image', emptyMatch), ImageMediaObject);
                assert.instanceOf(this.queue.take('video', emptyMatch), VideoMediaObject);
                assert.instanceOf(this.queue.take('text', emptyMatch), TextMediaObject);
                assert.instanceOf(this.queue.take('audio', emptyMatch), AudioMediaObject);
            });

            it('should not return an object if all of that type have been taken', function () {
                assert.instanceOf(this.queue.take('image', emptyMatch), ImageMediaObject);
                assert.isUndefined(this.queue.take('image', emptyMatch));
            });
        });
    });

    describe('filtering by type behavior with only 1 image', function () {
        beforeEach(function () {
            this.queue.setScene(makeScene({image: 1}));
        });

        describe('take()', function () {
            it('should return an ImageMediaObject when called with "image"', function () {
                assert.instanceOf(this.queue.take('image', emptyMatch), ImageMediaObject);
            });

            it('should return undefined when called with "video"', function () {
                assert.isUndefined(this.queue.take('video', emptyMatch));
            });
        });
    });

    describe('queue refilling behavior with 1 video and 2 images', function () {
        beforeEach(function () {
            this.queue.setScene(makeScene({video: 1, image: 2}));
        });

        describe('take()', function () {
            it('should return the same video after it is put back using give()', function () {
                var mo1 = this.queue.take('video', emptyMatch);
                this.queue.give(mo1);
                var mo2 = this.queue.take('video', emptyMatch);

                assert.strictEqual(mo1, mo2);
            });

            it('should return all objects for a type and then what ever one is given back', function () {
                var mo1 = this.queue.take('image', emptyMatch),
                    mo2 = this.queue.take('image', emptyMatch);
                
                this.queue.give(mo1);
                var mo3 = this.queue.take('image', emptyMatch);

                assert.notStrictEqual(mo1, mo2);
                assert.strictEqual(mo3, mo1);
            });
        });

    });

    describe('scene attributes', function () {
        function checkAttributes (expectedValues) {
            _.forEach(expectedValues, function(value, key) {
                it('should default queue.' + key + ' to ' + value, function () {
                    assert.strictEqual(_.deepGet(this.queue, key), value);
                });
            });
        }

        describe('using defaults', function () {
            beforeEach(function () {
                this.queue.setScene({});
            });

            checkAttributes({
                displayInterval: 3,
                displayDuration: 10,
                transitionDuration: 1,
                'maximumTypeCounts.image': 3,
                'maximumTypeCounts.video': 1, 
                'maximumTypeCounts.audio': 1,
                'maximumTypeCounts.text': 1
            });
        });

        describe('overridding defaults', function () {
            beforeEach(function () {
                this.queue.setScene({
                    displayInterval: 4,
                    displayDuration: 13,
                    transitionDuration: 3,
                    maximumOnScreen: {
                        image: 4,
                        text: 5,
                        video: 6,
                        audio: 7
                    }
                });
            });

            checkAttributes({
                displayInterval: 4,
                displayDuration: 13,
                transitionDuration: 3,
                'maximumTypeCounts.image': 4,
                'maximumTypeCounts.video': 6, 
                'maximumTypeCounts.audio': 7,
                'maximumTypeCounts.text': 5
            }); 

        });
        
    });

    describe('tagFiltering behavior', function () {
        beforeEach(function () {
            var scene = makeScene();
            scene.scene = [
                moWithTags('image', 'apples, bananas'),
                moWithTags('image', ''),
                moWithTags('audio', 'apples')
            ];

            this.queue.setScene(scene);
        });

        var carrotsMatcher = new TagMatcher('carrots');

        describe('take()ing an object, setting the tagMatcher, and take()ing another of the same type', function () {
            it('should not refill the queue with elements that have been taken but not replaced', function () {
                this.queue.take('audio', emptyMatch);
                assert.isUndefined(this.queue.take('audio', new TagMatcher('apples')));
            });
        });

        describe('setTagMatcher called with non-matching expression', function () {
            it('should return nothing from any type', function () {
                assert.isUndefined(this.queue.take('audio', carrotsMatcher));
                assert.isUndefined(this.queue.take('image', carrotsMatcher));
            });
        });

        describe('take called, then non-matching expression set', function () {
            beforeEach(function () {
                this.queue.take('image', emptyMatch);
                this.queue.take('audio', emptyMatch);
            });

            it('take return nothing for any type', function () {
                assert.isUndefined(this.queue.take('audio', carrotsMatcher));
                assert.isUndefined(this.queue.take('image', carrotsMatcher));
            }); 
        });

    });

    describe('edge cases', function () {
        
        describe('no scene set', function () {
        
            describe('take()', function () {
                it('should return undefined', function () {
                    assert.isUndefined(this.queue.take('image'), emptyMatch);
                });
            });
        });    
    });
});