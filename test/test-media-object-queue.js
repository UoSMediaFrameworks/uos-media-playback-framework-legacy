'use strict';

var _ = require('lodash');
_.mixin(require('lodash-deep'));
var MediaObjectQueue = require('../src/js/utils/media-object/media-object-queue');
var assert = require('chai').assert;
var chance = require('chance').Chance();
var inherits = require('inherits');
var MediaObject = require('../src/js/utils/media-object/media-object');
var TagMatcher = require('../src/js/utils/tag-matcher');


// Make FooMediaObject and BarMediaObject for testing the queue
function FooMediaObject (obj) {
    MediaObject.call(this, obj);
}
function BarMediaObject (obj) {
    MediaObject.call(this, obj);
}
inherits(BarMediaObject, MediaObject);
inherits(FooMediaObject, MediaObject);

FooMediaObject.typeName = 'foo';
BarMediaObject.typeName = 'bar';


function makeScene (ops) {
    var scene = [];

    if (ops) {
        ['bar', 'foo'].forEach(function(type) {
            for (var i = 0; i < ops[type] || 0; i++) {
                scene.push({
                    type: type,
                    url: chance.url()
                });
            }    
        });
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
        this.queue = new MediaObjectQueue(
            [FooMediaObject, BarMediaObject], 
            {foo: 2, bar: 2}
        );
    });


    describe('take() maximumOnScreen limits', function () {
        beforeEach(function () {
            var scene = makeScene({foo: 4});
            scene.maximumOnScreen = {foo: 1};
            this.queue.setScene(scene);
        });

        it('should only return one mediaObject and then undefined', function () {
            assert.instanceOf(this.queue.take([FooMediaObject]), FooMediaObject);
            assert.isUndefined(this.queue.take([FooMediaObject]));
        });

        it('should return a mediaObject once the count drops below the maximum', function () {
            var self = this;
            var mo = this.queue.take([FooMediaObject]);
            mo.play();
            
            assert.isUndefined(this.queue.take([FooMediaObject]));
            
            mo.stop();
            
            assert.instanceOf(this.queue.take([FooMediaObject]), FooMediaObject);
        });
    });

    describe('take() behavior with multiple types', function () {
        beforeEach(function () {
            this.queue.setScene(makeScene({foo: 1, bar: 1}));
        });

        describe('take([type])', function () {
            it('should return an object of single type if one is available', function () {
                assert.instanceOf(this.queue.take([FooMediaObject]), FooMediaObject);
                assert.instanceOf(this.queue.take([BarMediaObject]), BarMediaObject);
            });

            it('should return object that match one of any specified type when available', function () {
                var types = [BarMediaObject, FooMediaObject];

                _.forEach(types, function() {
                    var mo = this.queue.take(types);
                    if (! mo) {
                        assert.fail('no matching media object found');
                    }

                    var matchedType = _.find(types, function(type) { return mo instanceof type; });
                    if (! matchedType) {
                        assert.fail('did not return a media object matching one of the types');
                    }
                }.bind(this));
                    
            });

            it('should not return an object if all of that type have been taken', function () {
                assert.instanceOf(this.queue.take([BarMediaObject]), BarMediaObject);
                assert.isUndefined(this.queue.take([BarMediaObject]));
            });
        });
    });

    describe('filtering by type behavior with only 1 type', function () {
        beforeEach(function () {
            this.queue.setScene(makeScene({foo: 1}));
        });

        describe('take()', function () {
            it('should return requested type', function () {
                assert.instanceOf(this.queue.take([FooMediaObject]), FooMediaObject);
            });

            it('should return undefined when called with type not in scene', function () {
                assert.isUndefined(this.queue.take([BarMediaObject]));
            });
        });
    });

    describe('queue refilling behavior with different types', function () {
        beforeEach(function () {
            this.queue.setScene(makeScene({foo: 1, bar: 2}));
        });

        describe('take()', function () {
            it('should return the same mediaObject after it is stopped', function () {
                var mo1 = this.queue.take([FooMediaObject]);
                mo1.play();
                mo1.stop();
                
                var mo2 = this.queue.take([FooMediaObject]);

                assert.strictEqual(mo1, mo2);
            });
        });
    });

    describe('setScene(scene, {hardReset: true})', function () {
        it('should transition out any active mediaObjects', function (done) {
            this.queue.setScene(makeScene({foo: 2}));
            var mo = this.queue.take([FooMediaObject]);
            mo.play();
            mo.on('transition', function() {
                done();
            });
            this.queue.setScene(makeScene({foo: 2}), {hardReset: true});
        });

        it('should emit done any active mediaObjects', function (done) {
            this.queue.setScene(makeScene({foo: 2}));
            var mo = this.queue.take([FooMediaObject]);
            mo.play();
            mo.on('done', function() {
                done();
            });
            this.queue.setScene(makeScene({foo: 2}), {hardReset: true});
        });

        it('should allow reset any maximumOnScreen limits', function () {
            var scene = makeScene({foo: 2});
            scene.maximumOnScreen = {foo: 1};
            this.queue.setScene(scene);
            var mo = this.queue.take([FooMediaObject]);
            mo.play();

            this.queue.setScene(scene, {hardReset: true});
            assert(this.queue.take([FooMediaObject]));
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
                displayInterval: 3000,
                displayDuration: 10000,
                transitionDuration: 1400
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
                displayInterval: 4000,
                displayDuration: 13000,
                transitionDuration: 3000
            }); 

        });
        
    });

    describe('take() in conjuction with tagFiltering behavior', function () {
        beforeEach(function () {
            var scene = makeScene();
            scene.scene = [
                moWithTags('foo', 'apples, bananas'),
                moWithTags('foo', ''),
                moWithTags('bar', 'apples')
            ];

            this.queue.setScene(scene);
        });

        var carrotsMatcher = new TagMatcher('carrots');

        it('should not refill the queue with elements that dont match the active tagFilter', function () {
            var mo = this.queue.take([BarMediaObject]);
            mo.play();
            this.queue.setTagMatcher(carrotsMatcher);
            mo.stop();
            
            assert.isUndefined(this.queue.take([BarMediaObject]));
        });


        it('should return nothing if tagMatcher matches nothing', function () {
            this.queue.setTagMatcher(carrotsMatcher);
            assert.isUndefined(this.queue.take([FooMediaObject]));
            assert.isUndefined(this.queue.take([BarMediaObject]));
        });

    });

    describe('setTagFilter()', function () {
        beforeEach(function () {
            var scene = makeScene();
            scene.scene = [moWithTags('foo', 'apples')];
            this.queue.setScene(scene);

            this.mo = this.queue.take([FooMediaObject]);
            this.mo.play();
        });

        it('should trigger "done" events on any currently playing mediaObjects that don\'t match', function (done) {
            this.mo.on('done', function() {
                done();
            });

            this.queue.setTagMatcher(new TagMatcher('bananas'));
        });

        it('shouldn\'t trigger "done" events on playing mediaObjects that do match the new tagFilter', function () {
            this.mo.on('done', function() {
                assert.fail('done should not have been triggered');
            });

            this.queue.setTagMatcher(new TagMatcher('apples'));
        });
    });

    describe('edge cases', function () {
        
        describe('no scene set', function () {
        
            describe('take()', function () {
                it('should return undefined', function () {
                    assert.isUndefined(this.queue.take('image'));
                });
            });
        });    
    });
});