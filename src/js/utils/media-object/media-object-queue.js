'use strict';

var _ = require('lodash');
var TagMatcher = require('../tag-matcher');
var ImageMediaObject = require('./image-media-object');
var VideoMediaObject = require('./video-media-object');
var TextMediaObject = require('./text-media-object');
var AudioMediaObject = require('./audio-media-object');

var TYPE_MAPPINGS = {
    video: VideoMediaObject,
    image: ImageMediaObject,
    text: TextMediaObject,
    audio: AudioMediaObject
};

var SCENE_PROP_DEFAULTS = {
    displayInterval: 3,
    displayDuration: 10,
    transitionDuration: 1
};

// types and their default display counts
var MEDIA_TYPES = {
    image: 3,
    text: 1,
    video: 1,
    audio: 1
};


/* 
Handles maintaining the list of objects to display and also access to various
defaults of scene properties like displayInterval etc...
*/
function MediaObjectQueue() {
    // active queue of objects to shift/push from
    var queue = [],
    // list of objects that belong to the current scene
        masterList = [],
        tagMatcher = new TagMatcher();


    this.setScene = function(newScene) {
        // fill the masterList queue
        masterList = _(newScene.scene).map(function(mo) {
            if (TYPE_MAPPINGS.hasOwnProperty(mo.type)) {
                return new TYPE_MAPPINGS[mo.type](mo);    
            }
        }).filter(function(v) { return v !== undefined; }).valueOf();

        queue = _.clone(masterList);

        // default scene properties
        var sceneVal;
        _.forEach(SCENE_PROP_DEFAULTS, function(defaultVal, prop) {
            sceneVal = parseFloat(newScene[prop]);
            this[prop] = isNaN(sceneVal) ? defaultVal : sceneVal;
        }.bind(this));

        // default type counts
        this.maximumTypeCounts = _.reduce(MEDIA_TYPES, function(counts, defaultCount, type) {
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
    };

    this.take = function(type, tagMatcher) {
        var index = _.findIndex(queue, function(mo) { return mo.type === type && tagMatcher.match(mo.tags); });
        if (index !== -1) {
            return queue.splice(index, 1)[0];    
        } 
    };

    this.give = function(mediaObject) {
        // only add it back to the queue if it's found in the current masterList.
        // it wouldn't be found if the scene had changed.
        if (_.find(masterList, function(mo) { return mo === mediaObject; })) {
            queue.push(mediaObject);
        }    
    };
}

module.exports = MediaObjectQueue;