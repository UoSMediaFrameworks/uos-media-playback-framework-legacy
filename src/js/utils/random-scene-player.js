'use strict';

var _ = require('lodash');
var TagMatcher = require('./tag-matcher');

// types and their default display counts
var MEDIA_TYPES = {
    image: 3,
    text: 1,
    video: 1,
    audio: 1
};

var DEFAULT_STATIC_DISPLAY_DURATION = 10;

function RandomScenePlayer (elementManager) {
    this._playing = false;

    this._elementManager = elementManager;
    
    // default tag matching to all
    this._tagMatcher = new TagMatcher();

    this._scene = undefined;

    // contains arrays keyed by mediaObject type.  These are the random
    // generated lists of assets to display
    this._displayQueue = {};

    // total number of active items being displayed
    this._typeCounts = {};
}

function incrementTypeCount (self, type) {
    if (self._typeCounts[type]) {
        self._typeCounts[type] += 1;
    } else {
        self._typeCounts[type] = 1;
    }
}

function decrementTypeCount (self, type) {
    self._typeCounts[type] -= 1;
}

function getTypeCount(self, type) {
    return self._typeCounts[type] || 0;
}

function filterMediaScene(mediaScene, tagMatcher, mediaType) {
    return _.filter(mediaScene.scene, function (obj) {
        return (! mediaType || obj.type === mediaType) && tagMatcher.match(obj.tags);
    });
}

function parseTagString (tagString) {
    return _.uniq(_.map(tagString.split(','), function(s) { return s.trim(); }));
}

function getMaximumTypeCount(scene, type) {
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
}

function getStaticMediaTypeDisplayDuration (scene, mediaObject) {
    // be gentle on the poor user, parse their ints
    var duration = parseInt(scene.displayDuration);

    if (isNaN(duration)) {
        duration = DEFAULT_STATIC_DISPLAY_DURATION;
    }

    return duration;
}

// handles intelligent per type behavior for mediaObjects, dispatching to the proper methods for 
// their display
function showElementsOfType (self, mediaObjectType) {
    var displayDuration;
    var obj = nextMediaObject(self, mediaObjectType);

    if (obj) {
        incrementTypeCount(self, mediaObjectType);
        switch(mediaObjectType) {
            case 'image':
                displayDuration = getStaticMediaTypeDisplayDuration(self._scene, obj) * 1000;
                self._elementManager.showImage(obj.url, displayDuration, function() {
                    decrementTypeCount(self, mediaObjectType);
                    showElementsOfType(self, mediaObjectType);
                });
                break;

            case 'text':
                displayDuration = getStaticMediaTypeDisplayDuration(self._scene, obj) * 1000;
                self._elementManager.showText(obj.text, displayDuration, function() {
                    decrementTypeCount(self, mediaObjectType);
                    showElementsOfType(self, mediaObjectType);
                });
                break;

            case 'video':
                displayDuration = 3 * 1000;
                self._elementManager.showVideo(obj.url, function() {
                    decrementTypeCount(self, mediaObjectType);
                    showElementsOfType(self, mediaObjectType);
                });
                break;
        }

        
        // guess the duration to wait based on how many could be shown and for how long
        var wait = displayDuration / getMaximumTypeCount(self._scene, mediaObjectType);
        setTimeout(function() {
            showElementsOfType(self, mediaObjectType);    
        }, wait);
    }    
}


// if there's room in the scene, 
// return the next media object from the _displayQueue.  Refill the queue if needed
function nextMediaObject (self, type) {
    if (getTypeCount(self, type) < getMaximumTypeCount(self._scene, type)) {
        var value = self._displayQueue[type];
        if (Array.isArray(value) && value.length > 0) {
            return value.pop();
        } else {
            // regenerate the list
            regenerateDisplayQueue(self, type);
            return self._displayQueue[type].pop();
        }    
    }
    
}

function regenerateDisplayQueue (self, type) {
    // body...
    self._displayQueue[type] = filterMediaScene(self._scene, self._tagMatcher, type);
}


RandomScenePlayer.prototype.setScene = function(newScene) {
    var scene = _.cloneDeep(newScene);

    // best to parse the tag string up front, rather than every time a new media object is selected
    _.forEach(scene.scene, function(mediaObject) {
        mediaObject.tags = parseTagString(mediaObject.tags);
    });

    this._scene = scene;

    if (this._playing) {
        this._showNewMedia();
    }
};

RandomScenePlayer.prototype.setTagMatcher = function(newTagMatcher) {
    if (! this._tagMatcher.equalTo(newTagMatcher) ) {
        this._tagMatcher = newTagMatcher;
        // clearing existing queues will force it to regenerate with new tags
        this._displayQueue = {};
    }
};

RandomScenePlayer.prototype._showNewMedia = function() {
    _.chain(MEDIA_TYPES).keys().forEach(function(type) {
        showElementsOfType(this, type);
    }.bind(this));
    // showStaticElements(this, 'image');
    // showStaticElements(this, 'text');
    // showNewVideo(this);
};

RandomScenePlayer.prototype.start = function() {
    if (! this._playing) {
        this._playing = true;
        
        this._showNewMedia();
    }
};

module.exports = RandomScenePlayer;