'use strict';

var _ = require('lodash');

function RandomScenePlayer (elementManager) {
    this._elementMananger = elementManager;
}

function getRandomMediaObject(mediaScene, type) {
    var objs = filterMediaScene(mediaScene, [], type);
    return objs[Math.floor(Math.random() * objs.length)];
}

function filterMediaScene(mediaScene, tagsArray, mediaType) {
    return _.filter(mediaScene.scene, function (obj) {
        if ((tagsArray.length === 0 || _.intersection(obj.mediaObject.tags, tagsArray).length > 0 ) &&
            (! mediaType || obj.mediaObject.type === mediaType)) {
            return true;
        }
    });
}

RandomScenePlayer.prototype.setScene = function(scene) {
    this._scene = scene;
};

RandomScenePlayer.prototype.start = function() {
    this._imageInterval = setInterval(function() {
        var obj = getRandomMediaObject(this._scene, 'image');
        if (obj) {
            this._elementMananger.showImage(obj.mediaObject.url);    
        }
        
    }.bind(this), 3000);
};

module.exports = function(elementManager) {
    return new RandomScenePlayer(elementManager);
};