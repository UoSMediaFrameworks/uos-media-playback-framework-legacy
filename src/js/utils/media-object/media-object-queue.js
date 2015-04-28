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
        // objects that are up for display
    var queue = [],
        // list of objects that are currently out on loan from the queue
        active = [],
        // all objects in the scene
        masterList = [],
        tagMatcher = new TagMatcher(),
        maximumOnScreen = {};

    function activeCount (typeName) {
        return _.filter(active, function(mo) { return mo.constructor.typeName === typeName; }).length;
    }

    function moTransitionHandler (mediaObject) {
        // pull it out of the active list
        var activeIndex = _.findIndex(active, function(activeMo) { return activeMo === mediaObject; }); 
        active.splice(activeIndex, 1);
    }

    function moDoneHandler (mediaObject) {
        // make sure it's still in the masterList
        if (_.find(masterList, function(mo) { return mediaObject === mo; })) {
            if (tagMatcher.match(mediaObject.tags)) {
                queue.push(mediaObject);        
            }
        // otherwise it's from an older scene, so remove any event listeners
        } else {
            mediaObject.removeListener('transition', moTransitionHandler);
            mediaObject.removeListener('done', moDoneHandler);
        }
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

        // unhook events from mediaobjects that aren't in the new scene
        _.forEach(queue, function(mo) {
            mo.removeListener('transition', moTransitionHandler);
            mo.removeListener('done', moDoneHandler);
        });

        // process the mediaObjects
        var newMo, 
            index,
            oldMo;

        // make new masterList
        masterList = _.map(newScene.scene, function(mo) {
            var TypeConstructor = getTypeByName(mo.type);
            newMo = new TypeConstructor(mo, {
                displayDuration: this.displayDuration,
                transitionDuration: this.transitionDuration
            });
            newMo.on('transition', moTransitionHandler);
            newMo.on('done', moDoneHandler);
            
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
                activeMo.transition();
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
                    mo.transition();
                }).value();
        }
    };
}

module.exports = MediaObjectQueue;