'use strict';

var _ = require('lodash');
var ImageMediaObject = require('./image-media-object');

function MediaObjectQueue () {
    var queue = [],
        mediaObjectList = [];

    function refreshQueue () {
        queue = _.clone(mediaObjectList);
    }

    this.setScene = function(newScene) {
        mediaObjectList = _(newScene.scene).map(function(mo) {
            switch(mo.type) {
                case 'image': 
                    return new ImageMediaObject(mo);
            }
        }).filter(function(v) { return v !== undefined; }).valueOf();

    };

    this.nextWithAttrs = function () {
        if (queue.length === 0) { 
            refreshQueue(); 
        }

        return queue.pop();
    };

}

module.exports = MediaObjectQueue;