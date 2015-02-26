'use strict';

var _ = require('lodash');

var DEFAULT_MEDIA_TYPE_COUNTS = {
    image: 3,
    text: 1
};

var DEFAULT_STATIC_DISPLAY_DURATION = 6;

function RandomScenePlayer (elementManager) {
    this._playing = false;

    this._elementManager = elementManager;
    // holds tags assigned by setTagFilter
    this._manualTagFilter = [];
    // holds tags assigned by setThemeFilter
    this._themeTagFilter = [];

    // holds the unique'd version of both above, it's what actually gets checked
    this._tagFilter = [];

    // is there a video playing.  We track this here rather than in the _elementManager because
    // there's just one to keep tabs on, so easier to do it here.
    this._videoPlaying = false;

    this._scene = undefined;
}

function removeRandomMediaObject(mediaScene, tagsArray, type) {
    var objs = filterMediaScene(mediaScene, tagsArray, type);
    var obj = objs[Math.floor(Math.random() * objs.length)];

    if (obj) {
        mediaScene.scene.splice(mediaScene.scene.indexOf(obj), 1);
    }

    return obj;
}

function filterMediaScene(mediaScene, tagsArray, mediaType) {
    return _.filter(mediaScene.scene, function (obj) {
        if ((tagsArray.length === 0 || _.intersection(obj.tags, tagsArray).length > 0 ) &&
            (! mediaType || obj.type === mediaType)) {
            return true;
        }
    });
}

function parseTagString (tagString) {
    return _.uniq(_.map(tagString.split(','), function(s) { return s.trim(); }));
}

function mergeFilters (self) {
    var newVal = _.uniq(self._manualTagFilter.concat(self._themeTagFilter));
    if (! _.isEqual(self._tagFilter, newVal)) {
        self._tagFilter = newVal;
        self._showNewMedia();    
    }
    
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

RandomScenePlayer.prototype.setTagFilter = function(tagString) {
    tagString = tagString.trim();

    if (tagString !== '') {
        this._manualTagFilter = parseTagString(tagString);
    } else {
        this._manualTagFilter = [];
    }
    
    mergeFilters(this);
};

RandomScenePlayer.prototype.setThemeFilter = function(themeArray) {
    // concatenate the various tag strings of the themes
    if (themeArray.length > 0) {
        var themeTags = _.map(themeArray, function(theme) {
            return this._scene.themes[theme];
        }.bind(this)).join(',');

        this._themeTagFilter = parseTagString(themeTags);
    } else {
        this._themeTagFilter = [];
    }

    mergeFilters(this);
};

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


// returns the appropriate display duration (ms) for the passed in mediaObject
RandomScenePlayer.prototype._getDisplayDuration = function(mediaObject) {
    return 6000;
};

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
        var obj = removeRandomMediaObject(self._scene, self._tagFilter, 'video');
        if (obj) {
            self._videoPlaying = true;
            self._elementManager.showVideo(obj.url, function() {
                self._videoPlaying = false;
                // add it back
                self._scene.scene.push(obj);
                self._showNewVideo();
            });    
        }    
    }
}

function canShowMediaType(self, type) {
    return self._elementManager.getStaticTypeCount(type) < getMaximumTypeCount(self._scene, type);
}

function showStaticElements (self, mediaObjectType) {
    if (canShowMediaType(self, mediaObjectType)) {

        var obj = removeRandomMediaObject(self._scene, self._tagFilter, mediaObjectType);
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
                self._scene.scene.push(obj);
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

module.exports = function(elementManager) {
    return new RandomScenePlayer(elementManager);
};