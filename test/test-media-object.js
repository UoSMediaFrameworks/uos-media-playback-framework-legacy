'use strict';

var _ = require('lodash');
_.mixin(require('lodash-deep'));
var assert = require('chai').assert;
var chance = require('chance').Chance();
var MediaObject = require('../src/js/utils/media-object/media-object');


describe('MediaObject', function () {
    describe('stop()', function () {
        beforeEach(function () {
            this.mediaObject = new MediaObject();
        });

        it('should dispatch a "done" event if it was playing', function (done) {
            this.mediaObject.on('done', function() {
                done();
            });
            this.mediaObject.play();
            this.mediaObject.stop();    
        });

        it('should not dispatch a "done" event it it wasn\'t playing', function () {
            this.mediaObject.on('done', function() {
                assert.fail('"done" event was triggered');
            });

            // done dispatching should be synchronous
            this.mediaObject.stop();
        });
    });

    describe('"done" event', function () {
        it('should pass the MediaObject as the first argument to the event handler', function (done) {
            var mo = new MediaObject();
            mo.on('done', function(obj) {
                assert.strictEqual(mo, obj);
                done();
            });

            mo.play();
            mo.stop();
        });
    });
});

