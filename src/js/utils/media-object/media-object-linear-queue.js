'use strict';

var _ = require('lodash');
var
    TagMatcher = require('../tag-matcher');

var SCENE_PROP_DEFAULTS = {
    displayInterval: 3,
    displayDuration: 10,
    transitionDuration: 1.4
};

var LINEAR_OPT_LOOP_SEQUENCE = "playOnlySequencedMedia";
var LINEAR_OPT_LOOP_ONCE_REMAINING_RANDOM = "playRemainingMedia";
var LINEAR_OPT_LOOP_ONCE_ALL_RANDOM = "playAllMedia";

/*
 types - Array of constructors
 defaultDisplayCounts - {typeName: num, typeName, num, ...}
 */
function MediaObjectLinearQueue(types, defaultDisplayCounts, manager) {
    // objects that are up for display
    var queue = [],
    // list of objects that are currently out on loan from the queue
        active = [],
    // all buckets for linear playback
        masterBucketsList = {},
    // index for which bucket we are up to
        masterBucketListIndex = null,
        queueManager = manager,
    // APEP isLinearOption defines how
        isLinearOption = LINEAR_OPT_LOOP_ONCE_ALL_RANDOM,
    // APEP scenes can overide default behaviour to force each sequence to fully play
        isForceFullSequencePlayback = false,
        tagMatcher = new TagMatcher();

    this.setIsLinearOption = function(linearOption) {
        isLinearOption = linearOption;
    };

    this.setIsForceFullSequencePlayback = function (isForceFullSequencePlaybackOption) {
        isForceFullSequencePlayback = isForceFullSequencePlaybackOption;
    };

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
                // APEP for the linear playback mode, we never recycle media in a sequence so we don't really need this
                //queue.push(mediaObject);
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
            var sceneMediaObjectsForLinearPlayback = _.filter(newScene.scene, function(mo) { return mo.hasOwnProperty("sequenceNumber"); });
            // APEP for all media objects that are sequenced, add to buckets
            _.forEach(sceneMediaObjectsForLinearPlayback, function(mo) {

                var TypeConstructor = getTypeByName(mo.type);
                var newMo = new TypeConstructor(mo, {
                    displayDuration: this.displayDuration,
                    transitionDuration: this.transitionDuration
                });


                if(!masterBucketsList.hasOwnProperty(mo.sequenceNumber)) {
                    masterBucketsList[mo.sequenceNumber] = [];
                }

                masterBucketsList[mo.sequenceNumber].push(newMo);
            }.bind(this));
        } catch (e) {
            console.log("e: ", e);
            throw e;
        }

        if(Object.keys(masterBucketsList) === 0) {
            masterBucketListIndex = null;
            return;
        }

        this.initialiseToFirstBucket();

        // transition out all active mediaObjects
        if (ops.hardReset) {
            this.removalAllActiveMedia();
        }

    };

    this.removalAllActiveMedia = function() {
        _.forEach(_.clone(active), function(activeMo) {
            if(transitionFunc) {
                transitionFunc(activeMo);
            }
        });
    };

    // APEP allow the first bucket to be assigned to local state
    this.initialiseToFirstBucket = function() {
        // APEP first bucket
        masterBucketListIndex = _.min(Object.keys(masterBucketsList));

        // APEP fill the queue with the first bucket of media objects matching the tags
        queue = _.chain(masterBucketsList[masterBucketListIndex])
            .filter(function(mo) {
                return tagMatcher.match(mo.tags);
            })
            .value();
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

        // APEP set the linear queues index pointer to its own bucket as the next one, a circular index is used
        masterBucketListIndex = parseInt(buckets[nexButtonIndex]);

        // APEP if the linearOption defined specifies we should play media randomly after a single full set
        // And we are back at the start of the buckets, transition from linear queue to random queue
        if(isLinearOption === LINEAR_OPT_LOOP_ONCE_ALL_RANDOM && nexButtonIndex === 0) {
            if(queueManager) {
                queue = [];
                queueManager.transitionFromLinear();
                return;
            }
        }

        queue = _.chain(masterBucketsList[masterBucketListIndex])
            .filter(function(mo) {
                return tagMatcher.match(mo.tags);
            })
            .difference(active) // APEP filter active out, as they must be still playing
            .value();
    };

    // APEP make sure returns a list of media objects now
    this.take = function(args) {

        if(Object.keys(masterBucketsList) === 0) {
            return [];
        }

        var bucketMediaObjects = [];

        for (var i = 0; i < queue.length; i++) {

            var matchedMo = queue[i];

            active.push(matchedMo);

            // ensure it's set to be playing
            matchedMo._playing = true;

            bucketMediaObjects.push(matchedMo);
        }

        // APEP as we'e made all queue elements active, we do not need to track them
        queue = [];

        // APEP depending on the default or overidden behaviour - go to the next bucket ready for the next take(..) call
        if(!this.isCurrentBucketSolo()) {
            console.log("Current Bucket is not solo - go to the next");
            this.nextBucket();
        }

        return bucketMediaObjects;
    };

    // APEP function for queue to know if we should wait for transition of last media to go to the next bucket
    this.isCurrentBucketSolo = function() {

        // APEP if the scene does not require full playback, we exit out of this branch early
        if (!isForceFullSequencePlayback) {
            return false;
        }

        var autoreplayMedia = _.filter(masterBucketsList[masterBucketListIndex], function(mo) { return (mo.hasOwnProperty("autoreplay") && mo.autoreplay > 0) || (mo._obj.hasOwnProperty("autoreplay") && mo._obj.autoreplay > 0) });

 /*       console.log("isCurrentBucketSolo: ", autoreplayMedia.length > 0);
*/
        if(!autoreplayMedia.length > 0) {
            console.log("isCurrentBucketSolo: masterBucketsList[masterBucketListIndex], ", masterBucketsList[masterBucketListIndex])
        }

        return autoreplayMedia.length > 0;
    };

    this.isLinearQueueEmpty = function() {

        // APEP if the scene does not require full playback, we exit out of this branch early
        if (!isForceFullSequencePlayback) {
            return false;
        }

        // APEP check if the current bucket has any autoreplay > 0 if so, we need to respect the active or not
        var autoreplayMedia = _.filter(masterBucketsList[masterBucketListIndex], function(mo) { return (mo.hasOwnProperty("autoreplay") && mo.autoreplay > 0) || (mo._obj.hasOwnProperty("autoreplay") && mo._obj.autoreplay > 0) });
/*

        console.log("isLinearQueueEmpty - autoreplayMedia.length: ", autoreplayMedia.length);
        console.log("isLinearQueueEmpty - active.length: ", active.length);
*/

        // APEP if the current bucket has autoreplay media, we need to inspect the active list before we can allow the process to the next bucket
        var hasAutoReplayMediaAndActiveNotEmpty = autoreplayMedia.length > 0;

        // APEP if we have some auto replay media, we need to check if active is empty
        if(hasAutoReplayMediaAndActiveNotEmpty) {
            hasAutoReplayMediaAndActiveNotEmpty = hasAutoReplayMediaAndActiveNotEmpty && active.length > 0;
            return !hasAutoReplayMediaAndActiveNotEmpty;
        }

        // APEP else, don't let the player change buckets
        return false;
    };

    this.setTagMatcher = function(newTagMatcher) {
        if (! tagMatcher.equalTo(newTagMatcher)) {
            tagMatcher = newTagMatcher;

            // fill queue with all newly matching mos from masterList that aren't currently playing
            queue = _.chain(masterBucketsList[masterBucketListIndex])
                .filter(function(mo) {
                    return tagMatcher.match(mo.tags);
                })
                .difference(active)
                .value();

            // transition out currently playin non-matching videos
            _.chain(active)
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

module.exports = MediaObjectLinearQueue;
