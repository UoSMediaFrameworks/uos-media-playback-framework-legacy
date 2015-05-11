'use strict';
/* jshint browser:true */
var _ = require('lodash');
var VideoMediaObject = require('./media-object/video-media-object');
var variableThrottle = require('./variable-throttle');
var ImageMediaObject = require('./media-object/image-media-object');
var TextMediaObject = require('./media-object/text-media-object');


function RandomVisualPlayer (stageElement, queue) {

    var showMedia = variableThrottle(function() {
        _.forEach([VideoMediaObject, ImageMediaObject, TextMediaObject], function(moType) {
            var obj = queue.take([moType]);
            if (obj) {
                obj.on('done', moDoneHandler);
                obj.on('transition', moTransitionHandler);

                obj.makeElement(function() {
                    obj.onReady(function() {
                        if (obj instanceof ImageMediaObject || obj instanceof TextMediaObject) {
                            stageElement.appendChild(obj.element);
                            placeAtRandomPosition(obj.element);
                        }

                        obj.play();
                        obj.element.classList.add('show-media-object');
                    });

                    if (obj instanceof VideoMediaObject) {
                        stageElement.appendChild(obj.element);
                        placeAtRandomPosition(obj.element);    
                    }
                });
            }    
        });
    }, function() {
        return queue.displayInterval;
    });


    function calcDimension(dim, element) {
        var elementDimensionSize = element[dim];

        var randomNonOverlapPosition = Math.random() * (stageElement[dim] - elementDimensionSize);
        // allow potential overlap of up to 30% of element's dimension
        var potentialOverlap = _.random(-0.3, 0.3) * elementDimensionSize;

        
        return Math.round(randomNonOverlapPosition + potentialOverlap) + 'px';
    }

    function placeAtRandomPosition(element) {
        element.style.left = calcDimension('clientWidth', element);
        element.style.top = calcDimension('clientHeight', element);
    }

    this.setMediaObjectQueue = function(newQueue) {
        queue = newQueue;
    };

    function moDoneHandler (mediaObject) {
        mediaObject.removeListener('done', moDoneHandler);
        stageElement.removeChild(mediaObject.element);
        showMedia();
    }

    function moTransitionHandler (mediaObject) {
        mediaObject.removeListener('transition', moTransitionHandler);
        mediaObject.element.classList.remove('show-media-object');
        showMedia();
    }

    this.start = function() {
        showMedia();

        if (queue.displayInterval) {
            window.setInterval(showMedia, queue.displayInterval);
        }
    };
}

module.exports = RandomVisualPlayer;