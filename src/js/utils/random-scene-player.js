'use strict';

var _ = require('lodash');

function RandomScenePlayer (elementManager) {
    this._elementMananger = elementManager;
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
    return _.map(tagString.split(','), function(s) { return s.trim(); });
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
    this._tagFilter = parseTagString(tagString);
};

RandomScenePlayer.prototype.start = function() {
    this._imageInterval = setInterval(function() {
        var obj = getRandomMediaObject(this._scene, this._tagFilter, 'image');
        if (obj) {
            this._elementMananger.showImage(obj.url);    
        }
        
    }.bind(this), 3000);
};

module.exports = function(elementManager) {
    return new RandomScenePlayer(elementManager);
};