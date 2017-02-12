'use strict';

var _ = require('lodash');
var TagMatcher = require('../tag-matcher');
var ImageMediaObject = require('./image-media-object');
var VideoMediaObject = require('./video-media-object');
var TextMediaObject = require('./text-media-object');
var AudioMediaObject = require('./audio-media-object');

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
        // all objects in the scene
        masterList = [],
        tagMatcher = new TagMatcher(),
        queueManager = manager,
        isRandomOptions = "default",
        maximumOnScreen = {};

    this.setIsRandomOptions = function(randomOption) {
        isRandomOptions = randomOption;
    };

    // APEP allow the queue to be referenced outside the object (this is a short term addition)
    this.getQueue = function() {
        return queue;
    };

    var transitionFunc;

    function activeCount (typeName) {
        return _.filter(active, function(mo) { return mo.constructor.typeName === typeName; }).length;
    }

    this.moTransitionHandler = moTransitionHandler;

    function moTransitionHandler (mediaObject) {

        // console.log("Media-object-queue - transitionHandler handler - mediaObject: ", mediaObject);

        // console.log("Media-object-queue - transitionHandler handler - active.length before: ", active);

        // pull it out of the active list
        var activeIndex = _.findIndex(active, function(activeMo) { return activeMo === mediaObject; });
        active.splice(activeIndex, 1);

        // console.log("Media-object-queue - transitionHandler handler - active.length after: ", active);
    }

    this.moDoneHandler = moDoneHandler;

    function moDoneHandler (mediaObject) {

        // console.log("Media-object-queue - done handler - mediaObject: ", mediaObject);

        // make sure it's still in the masterList
        if (_.find(masterList, function(mo) { return mediaObject === mo; })) {
            if (tagMatcher.match(mediaObject.tags)) {

                // APEP pushing ended active media back to the queue is optional, this allows remaining media to be played only once
                if(isRandomOptions === "default") {
                    console.log("media-object-queue - add from active to queue");
                    queue.push(mediaObject);
                }
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

    this.refreshQueueValuesForNonDefaultBehaviour = function() {
        // fill the queue with matching mediaObjects
        queue = _(masterList)
            .filter(function(mo) {
                return tagMatcher.match(mo.tags);
            })
            .shuffle()
            .value();
    };

    this.setScene = function(newScene, ops) {
        ops = ops || {};
        ops.hardReset = ops.hardReset || false;

        // process scene attributes
        var sceneVal;
        _.forEach(SCENE_PROP_DEFAULTS, function(defaultVal, prop) {
            sceneVal = parseFloat(newScene[prop]);
            this[prop] = isNaN(sceneVal) ? defaultVal * 1000 : sceneVal * 1000;
        }.bind(this));

        // default type counts
        maximumOnScreen = _.reduce(defaultDisplayCounts, function(counts, defaultCount, type) {
            var count;
            try {
                count = parseInt(newScene.maximumOnScreen[type]);
            } catch (e) {
                if (e instanceof TypeError) {
                    // do nothing, this just means there is no specified maximumOnScreen object in the scene
                    // we just go with the default then
                } else {
                    throw e;
                }
            } finally {
                if (isNaN(count)){
                    count = defaultCount;
                }
                counts[type] = count;
                return counts;
            }
        }, {});


        // process the mediaObjects
        var newMo,
            index,
            oldMo;

        var masterListMediaObjects = _.filter(newScene.scene, function(mo) {
            // APEP if we are not in default mode, only non sequenced media can be included
           if(isRandomOptions === "playRemainingMedia") {
               return !mo.hasOwnProperty("sequenceNumber");
           } else {
               return true;
           }
        });

        console.log("media-object-queue - newScene.scene.length, masterListMediaObjects.length: ", newScene.scene.length, masterListMediaObjects.length);

        // make new masterList using media Object list built for optional logic
        masterList = _.map(masterListMediaObjects, function(mo) {
            var TypeConstructor = getTypeByName(mo.type);
            newMo = new TypeConstructor(mo, {
                displayDuration: this.displayDuration,
                transitionDuration: this.transitionDuration
            });

            return newMo;
        }.bind(this));

        // fill the queue with matching mediaObjects
        queue = _(masterList)
            .filter(function(mo) {
                return tagMatcher.match(mo.tags);
            })
            .shuffle()
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

    this.take = function(typesArray) {
        var activeSoloTypes = _(active)
            .filter(function(mo) {
                return mo._obj.solo === true && mo._playing === true;
            })
            .map(function(mo) {
                return mo.constructor;
            }).value();

        var eligibleTypes = _(typesArray)
            .filter(function(moType) {
                return activeCount(moType.typeName) < maximumOnScreen[moType.typeName];
            })
            .difference(activeSoloTypes).value();

        function checkType (obj) {
            return _.find(eligibleTypes, function(type) {
                return queue[i] instanceof type;
            });
        }

        if (eligibleTypes.length > 0) {
            var matchedType, matchedMo;

            // APEP if we are not in the default mode, we must see if we have ran out of remaining media to transition back to linear
            if(isRandomOptions !== "default") {
                console.log("We are not in default mode, check if we need to transition - queue: ", queue);
                if(queue.length === 0) {
                    console.log("the queue is empty, transition from random to linear");
                    queueManager.transitionFromRandom();
                    return;
                }
            }

            for (var i = 0; i < queue.length; i++) {
                matchedType = checkType(queue[i]);

                if (matchedType) {
                    matchedMo = queue[i];

                    // if the next mo in the queue is marked as solo, only give it back once
                    // all other active mo's of the same type are off the stage
                    if (matchedMo._obj.solo !== true || (matchedMo._obj.solo === true && activeCount(matchedType.typeName) === 0)) {
                        queue.splice(i, 1);
                        active.push(matchedMo);

                        // ensure it's set to be playing
                        matchedMo._playing = true;

                        return [matchedMo];
                    } else {
                        // there is a solo waiting at the front of the queue
                        // so return nothing and wait till next time
                        return [];
                    }
                }
            }
        }


    };

    this.setTagMatcher = function(newTagMatcher) {
        if (! tagMatcher.equalTo(newTagMatcher)) {
            tagMatcher = newTagMatcher;

            // fill queue with all newly matching mos from masterList that aren't currently playing
            queue = _(masterList)
                .filter(function(mo) {
                    return tagMatcher.match(mo.tags);
                })
                .difference(active)
                .shuffle()
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
    this.getMasterList = function(){
        return masterList;
    };

    this.setTransitionHandler = function(func) {
          transitionFunc = func;
    };
}

module.exports = MediaObjectQueue;
