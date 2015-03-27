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
    displayDuration: 10
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
    // MediaObjects keyed by type
    var queue = {},
        mediaObjectList = {},
        tagMatcher = new TagMatcher();

    function refreshQueue(type) {
        queue[type] = _.filter(mediaObjectList, function(mo) {
            return mo.type === type && tagMatcher.match(mo.tags);
        });
    }

    this.setScene = function(newScene) {
        // fill the queue
        mediaObjectList = _(newScene.scene).map(function(mo) {
            if (TYPE_MAPPINGS.hasOwnProperty(mo.type)) {
                return new TYPE_MAPPINGS[mo.type](mo);    
            }
        }).filter(function(v) { return v !== undefined; }).valueOf();

        refreshQueue();

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

    this.setTagMatcher = function(newTagMatcher) {
        if (! tagMatcher.equalTo(newTagMatcher) ) {
            tagMatcher = newTagMatcher;
            refreshQueue();
        }
    };

    this.nextByType = function(type) {
        if (! queue[type] || queue[type].length === 0) { 
            refreshQueue(type); 
        }

        return queue[type].pop();
    };

    this.getMaximumTypeCount = function(type) {
        var maximum,
            defaultCount = MEDIA_TYPES[type];
        // wrap in try catch incase attribute is missing from the json
        try {
            maximum = parseInt(scene.maximumOnScreen[type]);
        } catch (e) {
            if (e instanceof TypeError) {
                // do nothing, this just means there is no specified maximumOnScreen object in the scene
                // we just go with the default then
            } else {
                throw e;
            }
        } finally {
            if (isNaN(maximum)){
                maximum = defaultCount;
            }
            return maximum;
        }
    };
}

module.exports = MediaObjectQueue;