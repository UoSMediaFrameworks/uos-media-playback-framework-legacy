'use strict';

var _ = require('lodash');
var TagMatcher = require('./tag-matcher');

var DEFAULT_MEDIA_TYPE_COUNTS = {
    image: 3,
    text: 1
};

var DEFAULT_STATIC_DISPLAY_DURATION = 10;

function RandomScenePlayer (elementManager) {
    this._playing = false;

    this._elementManager = elementManager;
    
    // default tag matching to all
    this._tagMatcher = new TagMatcher();

    // is there a video playing.  We track this here rather than in the _elementManager because
    // there's just one to keep tabs on, so easier to do it here.
    this._videoPlaying = false;

    this._scene = undefined;

    // contains arrays keyed by mediaObject type.  These are the random
    // generated lists of assets to display
    this._displayQueue = {};
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
        defaultCount = DEFAULT_MEDIA_TYPE_COUNTS[type];
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


function showNewVideo(self) {
    if (! self._videoPlaying) {
        var obj = nextMediaObject(self, 'video');
        if (obj) {
            self._videoPlaying = true;
            self._elementManager.showVideo(obj.url, function() {
                self._videoPlaying = false;
                // add it back
                self._scene.scene.push(obj);
                showNewVideo(self);
            });    
        }    
    }
}

function canShowMediaType(self, type) {
    return self._elementManager.getStaticTypeCount(type) < getMaximumTypeCount(self._scene, type);
}

function showStaticElements (self, mediaObjectType) {
    if (canShowMediaType(self, mediaObjectType)) {

        var obj = nextMediaObject(self, mediaObjectType);
        if (obj) {
            var value;
            switch(mediaObjectType) {
                case 'image':
                    value = obj.url;
                    break;

                case 'text':
                    value = obj.text;
                    break;
            }

            var displayDuration = getStaticMediaTypeDisplayDuration(self._scene, obj) * 1000;
            self._elementManager.showStaticType(mediaObjectType, value, displayDuration, function() {
                showStaticElements(self, mediaObjectType);    
            }); 

            // guess the duration to wait based on how many could be shown and for how long
            var wait = displayDuration / getMaximumTypeCount(self._scene, mediaObjectType);
            setTimeout(function() {
                showStaticElements(self, mediaObjectType);    
            }, wait);
        }    
    }
}

// return the next media object from the _displayQueue.  Refill the queue if needed
function nextMediaObject (self, type) {
    var value = self._displayQueue[type];
    if (Array.isArray(value) && value.length > 0) {
        return value.pop();
    } else {
        // regenerate the list
        regenerateDisplayQueue(self, type);
        return self._displayQueue[type].pop();
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
        this._showNewMedia();    
    }
};

RandomScenePlayer.prototype._showNewMedia = function() {
    showStaticElements(this, 'image');
    showStaticElements(this, 'text');
    showNewVideo(this);
};

RandomScenePlayer.prototype.start = function() {
    if (! this._playing) {
        this._playing = true;
        
        this._showNewMedia();
    }
};

module.exports = RandomScenePlayer;