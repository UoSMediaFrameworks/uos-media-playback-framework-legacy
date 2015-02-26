'use strict';

var _ = require('lodash');

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
}

function getRandomMediaObject(mediaScene, tagsArray, type) {
    var objs = filterMediaScene(mediaScene, tagsArray, type);
    return objs[Math.floor(Math.random() * objs.length)];
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
    self._tagFilter = _.uniq(self._manualTagFilter.concat(self._themeTagFilter));
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

RandomScenePlayer.prototype.getRandomMediaObject = function(type) {
    return getRandomMediaObject(this._scene, this._tagFilter, type);
};


RandomScenePlayer.prototype._getMaximum = function(attribute, defaultCount) {
    var maximum;
    // wrap in try catch incase attribute is missing from the json
    try {
        maximum = this._scene.maximumOnScreen[attribute];
    } catch (e) {
        if (e instanceof TypeError) {
            console.log('missing maximumOnScreen.' + attribute + ' in scene JSON, defaulting to ' + defaultCount);
        } else {
            throw e;
        }
    } finally {
        if (maximum === null || maximum === undefined || isNaN(maximum)){
            maximum = defaultCount;
        }
        return maximum;
    }
};

// returns true if there is 1 less than the maximum number of images currently
// being displayed
RandomScenePlayer.prototype._canShowImage = function() {
    return this._elementManager.getImageCount() < this._getMaximum('images', 3);
};

RandomScenePlayer.prototype._canShowText = function() {
    return this._elementManager.getTextCount() < this._getMaximum('text', 1);
};

// returns the appropriate display duration (ms) for the passed in mediaObject
RandomScenePlayer.prototype._getDisplayDuration = function(mediaObject) {
    return 6000;
};

RandomScenePlayer.prototype._showNewImages = function() {
    var obj = this.getRandomMediaObject('image');
    if (obj && this._canShowImage()) {
        this._elementManager.showImage(obj.url, this._getDisplayDuration(obj), function() {
            this._showNewImages();
        }.bind(this)); 

        this._showNewImages();
    }
};

RandomScenePlayer.prototype._showNewVideo = function() {
    if (! this._videoPlaying) {
        var obj = this.getRandomMediaObject('video');
        if (obj) {
            this._videoPlaying = true;
            this._elementManager.showVideo(obj.url, function() {
                this._videoPlaying = false;
                this._showNewVideo();
            }.bind(this));    
        }    
    }
    
};

RandomScenePlayer.prototype._showNewText = function() {
    var obj = this.getRandomMediaObject('text');
    if (obj && this._canShowText()) {
        this._elementManager.showText(obj.text, this._getDisplayDuration(obj), function() {
            this._showNewText();
        }.bind(this)); 

        this._showNewText();
    }
};

RandomScenePlayer.prototype._showNewMedia = function() {
    this._showNewImages();
    this._showNewVideo();
    this._showNewText();
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