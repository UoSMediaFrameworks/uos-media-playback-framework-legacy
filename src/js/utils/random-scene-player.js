'use strict';

var _ = require('lodash');

function RandomScenePlayer (elementManager) {
    this._playing = false;

    this._elementMananger = elementManager;
    // holds tags assigned by setTagFilter
    this._manualTagFilter = [];
    // holds tags assigned by setThemeFilter
    this._themeTagFilter = [];

    // holds the unique'd version of both above, it's what actually gets checked
    this._tagFilter = [];
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
    console.dir(self._tagFilter);
}

RandomScenePlayer.prototype.setScene = function(newScene) {
    var scene = _.cloneDeep(newScene);

    // best to parse the tag string up front, rather than every time a new media object is selected
    _.forEach(scene.scene, function(mediaObject) {
        mediaObject.tags = parseTagString(mediaObject.tags);
    });

    this._scene = scene;
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

RandomScenePlayer.prototype.start = function() {
    if (! this._playing) {
        this._playing = true;
        
        this._imageInterval = setInterval(function() {
            var obj = getRandomMediaObject(this._scene, this._tagFilter, 'image');
            if (obj) {
                this._elementMananger.showImage(obj.url);    
            }
            
        }.bind(this), 3000);
    }
};

module.exports = function(elementManager) {
    return new RandomScenePlayer(elementManager);
};