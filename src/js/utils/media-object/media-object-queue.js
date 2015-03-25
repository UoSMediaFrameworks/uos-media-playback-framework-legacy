'use strict';

var _ = require('lodash');
var TagMatcher = require('../tag-matcher');
var ImageMediaObject = require('./image-media-object');
var VideoMediaObject = require('./video-media-object');
var TextMediaObject = require('./text-media-object');

var typeMappings = {
    video: VideoMediaObject,
    image: ImageMediaObject,
    text: TextMediaObject
};

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

        mediaObjectList = _(newScene.scene).map(function(mo) {
            if (typeMappings.hasOwnProperty(mo.type)) {
                return new typeMappings[mo.type](mo);    
            }
        }).filter(function(v) { return v !== undefined; }).valueOf();

        refreshQueue();
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

}

module.exports = MediaObjectQueue;