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
function MediaObjectQueue(types, defaultDisplayCounts) {
        // active queue of objects to shift/push from
    var queue = [],
        // list of objects that are currently out on load from the queue
        active = [],
        // list of objects that belong to the current scene
        masterList = [],
        tagMatcher = new TagMatcher(),
        maximumOnScreen = {},
        countOnScreen = {};

    // initialize all counts as 0
    _.forEach(types, function(type) { 
        countOnScreen[type.typeName] = 0; 
    });

    function moTransitionHandler (mediaObject) {
        // decrement type count
        countOnScreen[mediaObject.constructor.typeName]--;
    }

    function moDoneHandler (mediaObject) {
        // pull it out of the active list
        var activeIndex = _.findIndex(active, function(activeMo) { return activeMo === mediaObject; }); 
        active.splice(activeIndex, 1);
        // make sure it's still in the masterList and matches the current tagMatcher
        if (_.find(masterList, function(mo) { return mediaObject === mo; }) && tagMatcher.match(mediaObject.tags)) {
            queue.push(mediaObject);    
        }
    }

    function getTypeByName (typeName) {
        var t = _.find(types, function(t) { return t.typeName === typeName; });

        if (! t) {
            throw 'type "' + typeName + '" not found.  Needs to be passed to constructor.';
        }

        return t;
    }

    this.setScene = function(newScene) {

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
        var oldMasterList = _.clone(masterList);
        masterList = [];
        var newMo, 
            index,
            oldMo;

        // make new masterList, reusing old matching objects if any
        _.forEach(newScene.scene, function(mo) {
            var index = _.findIndex(oldMasterList, function(oldMo) { return _.isEqual(oldMo._obj, mo); });
            if (index !== -1) {
                oldMo = oldMasterList.splice(index, 1)[0];
                masterList.push(oldMo);
            } else {
                var TypeConstructor = getTypeByName(mo.type);
                newMo = new TypeConstructor(mo, {
                    displayDuration: this.displayDuration,
                    transitionDuration: this.transitionDuration
                });
                newMo.on('transition', moTransitionHandler);
                newMo.on('done', moDoneHandler);
                masterList.push(newMo);
            }
        }.bind(this));

        // unhook events from mediaobjects that aren't in the new scene
        _.forEach(oldMasterList, function(mo) {
            mo.stop();
            mo.removeListener('transition', moTransitionHandler);
            mo.removeListener('done', moDoneHandler);
        });

        // fill the queue with matching mediaObjects that aren't currently active
        queue = _(masterList)
            .difference(active)
            .filter(function(mo) {
                return tagMatcher.match(mo.tags);
            })
            .shuffle()
            .value();
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
                return countOnScreen[moType.typeName] < maximumOnScreen[moType.typeName];
            })
            .difference(activeSoloTypes).value();

        function checkType (obj) {
            return _.find(eligibleTypes, function(type) { 
                return queue[i] instanceof type; 
            });
        }

        if (eligibleTypes.length > 0) {
            var matchedType, matchedMo;

            for (var i = 0; i < queue.length; i++) {
                matchedType = checkType(queue[i]);

                if (matchedType) {
                    matchedMo = queue[i];

                    // if the next mo in the queue is marked as solo, only give it back once
                    // all other active mo's of the same type are off the stage
                    if (matchedMo._obj.solo !== true || (matchedMo._obj.solo === true && countOnScreen[matchedType.typeName] === 0)) {
                        countOnScreen[matchedType.typeName]++;
                        queue.splice(i, 1);
                        active.push(matchedMo);

                        // ensure it's set to be playing
                        matchedMo._playing = true;

                        return matchedMo;
                    } else {
                        // there is a solo waiting at the front of the queue
                        // so return nothing and wait till next time
                        return undefined;
                    }
                }    
            }     
        }

        
    };

    this.setTagMatcher = function(newTagMatcher) {
        if (! tagMatcher.equalTo(newTagMatcher)) {
            tagMatcher = newTagMatcher;
            // clear the current queue
            queue = [];
            _.forEach(masterList, function(mo) {
                var activeIndex = _.findIndex(active, function(activeMo) { return activeMo === mo; }); 
                if ( tagMatcher.match(mo.tags) ) {
                    if(activeIndex === -1 ) {
                        queue.push(mo);
                    }
                } else if (activeIndex > -1) {
                    mo.transition();
                }
            });
        }
    };
}

module.exports = MediaObjectQueue;