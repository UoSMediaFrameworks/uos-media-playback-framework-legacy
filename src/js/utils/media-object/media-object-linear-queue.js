'use strict';

var _ = require('lodash');
var TagMatcher = require('../tag-matcher');

var SCENE_PROP_DEFAULTS = {
    displayInterval: 3,
    displayDuration: 10,
    transitionDuration: 1.4
};

/*
 types - Array of constructors
 defaultDisplayCounts - {typeName: num, typeName, num, ...}
 */
function MediaObjectQueue(types, defaultDisplayCounts, manager) {
    // objects that are up for display
    var queue = [],
    // list of objects that are currently out on loan from the queue
        active = [],
    // all buckets for linear playback
        masterBucketsList = {},
    // index for which bucket we are up to
        masterBucketListIndex = null,
        queueManager = manager,
        tagMatcher = new TagMatcher();

    this.getActive = function() {
        return active;
    };

    // APEP allow the queue to be referenced outside the object (this is a short term addition)
    this.getQueue = function() {
        return queue;
    };

    var transitionFunc;

    this.moTransitionHandler = moTransitionHandler;

    function moTransitionHandler (mediaObject) {

        // console.log("Media-object-queue - transitionHandler handler - mediaObject: ", mediaObject);

        // pull it out of the active list
        var activeIndex = _.findIndex(active, function(activeMo) { return activeMo === mediaObject; });
        active.splice(activeIndex, 1);

        // console.log("Media-object-queue - transitionHandler handler - active.length after: ", active);
    }

    this.moDoneHandler = moDoneHandler;

    function moDoneHandler (mediaObject) {

        // console.log("Media-object-queue - done handler - mediaObject: ", mediaObject);

        // make sure it's still in the masterList
        if (_.find(masterBucketsList[masterBucketListIndex], function(mo) { return mediaObject === mo; })) {
            if (tagMatcher.match(mediaObject.tags)) {
                queue.push(mediaObject);
            }
        }

        // console.log("Media-object-queue - done handler - queue end: ", queue);
    }

    function getTypeByName (typeName) {
        var t = _.find(types, function(t) { return t.typeName === typeName; });

        if (! t) {
            throw 'type "' + typeName + '" not found.  Needs to be passed to constructor.';
        }

        return t;
    }

    this.setScene = function(newScene, ops) {

        ops = ops || {};
        ops.hardReset = ops.hardReset || false;

        // process scene attributes
        var sceneVal;
        _.forEach(SCENE_PROP_DEFAULTS, function(defaultVal, prop) {
            sceneVal = parseFloat(newScene[prop]);
            this[prop] = isNaN(sceneVal) ? defaultVal * 1000 : sceneVal * 1000;
        }.bind(this));

        try {
            masterBucketsList = {};
            // APEP get all media objects with sequenceByNumber
            var sceneMediaObjectsForLinearPlayback = _.filter(newScene.scene, function(mo) { return mo.hasOwnProperty("sequenceByNumber"); });
            // APEP for all media objects that are sequenced, add to buckets
            _.forEach(sceneMediaObjectsForLinearPlayback, function(mo) {

                var TypeConstructor = getTypeByName(mo.type);
                var newMo = new TypeConstructor(mo, {
                    displayDuration: this.displayDuration,
                    transitionDuration: this.transitionDuration
                });


                if(!masterBucketsList.hasOwnProperty(mo.sequenceByNumber)) {
                    masterBucketsList[mo.sequenceByNumber] = [];
                }

                masterBucketsList[mo.sequenceByNumber].push(newMo);
            }.bind(this));
        } catch (e) {
            console.log("e: ", e);
            throw e;
        }

        if(Object.keys(masterBucketsList) === 0) {
            masterBucketListIndex = null;
            return;
        }

        // APEP first bucket
        masterBucketListIndex = _.min(Object.keys(masterBucketsList));

        // APEP fill the queue with the first bucket of media objects matching the tags
        queue = _(masterBucketsList[masterBucketListIndex])
            .filter(function(mo) {
                return tagMatcher.match(mo.tags);
            })
            .value();

        // transition out all active mediaObjects
        if (ops.hardReset) {
            _.forEach(_.clone(active), function(activeMo) {
                if(transitionFunc) {
                    transitionFunc(activeMo);
                }
            });
        }

    };

    // APEP use the bucket keys as a circular list, allowing next buckets to go through the cycle
    this.nextBucket = function() {

        // APEP get all the bucket numbers
        var bucketNumbers = Object.keys(masterBucketsList);

        // APEP sort them so we can get next one from index addition
        var buckets = _.sortBy(bucketNumbers, function(bucketIndexA, bucketIndexB){
            return bucketIndexA >= bucketIndexB;
        });

        // APEP find the current button index, Object.keys() creates strings so we need to indexOf current MasterBucketListIndex as string
        var currentButtonIndex = buckets.indexOf(masterBucketListIndex.toString());

        var nexButtonIndex = currentButtonIndex === buckets.length - 1 ? 0 : currentButtonIndex + 1;

        // APEP this is the transition between types of queues, we should probably handle this a bit better
        if(nexButtonIndex === 0) {
            if(queueManager) {
                queue = [];
                // _.forEach(_.clone(active), function(activeMo) {
                //     if(transitionFunc) {
                //         transitionFunc(activeMo);
                //     }
                // });
                queueManager.transitionFromLinear();
            }
        }

        masterBucketListIndex = parseInt(buckets[nexButtonIndex]);

        // TODO APEP might have to filter based on active
        queue = _(masterBucketsList[masterBucketListIndex])
            .filter(function(mo) {
                return tagMatcher.match(mo.tags);
            })
            .value();
    };

    // APEP make sure returns a list of media objects now
    this.take = function(args) {

        if(Object.keys(masterBucketsList) === 0) {
            return [];
        }

        // APEP TODO Discuss as dev group if we want no overlap between sequences
        var bucketMediaObjects = [];

        for (var i = 0; i < queue.length; i++) {

            var matchedMo = queue[i];

            active.push(matchedMo);

            // ensure it's set to be playing
            matchedMo._playing = true;

            bucketMediaObjects.push(matchedMo);
        }

        queue = []; // APEP TODO not sure if this is needed

        this.nextBucket(); // APEP Resolve

        return bucketMediaObjects;
    };

    this.setTagMatcher = function(newTagMatcher) {
        if (! tagMatcher.equalTo(newTagMatcher)) {
            tagMatcher = newTagMatcher;

            // fill queue with all newly matching mos from masterList that aren't currently playing
            queue = _(masterBucketsList[masterBucketListIndex])
                .filter(function(mo) {
                    return tagMatcher.match(mo.tags);
                })
                .difference(active)
                .value();

            // transition out currently playin non-matching videos
            _(active)
                .filter(function(mo) {
                    return ! tagMatcher.match(mo.tags);
                }).each(function(mo) {
                if(transitionFunc) {
                    transitionFunc(mo);
                }
            }).value();
        }
    };

    // 30/11/2016 Angel.P : these methods are here for development purposes to check on the queue's internal state
    this.getActive = function(){
        return active;
    };

    this.setTransitionHandler = function(func) {
        transitionFunc = func;
    };
}

module.exports = MediaObjectQueue;
