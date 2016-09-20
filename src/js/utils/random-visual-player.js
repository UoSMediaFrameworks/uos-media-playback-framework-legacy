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

            var style = obj ? obj.style : {};

            if (obj) {
                obj.on('done', moDoneHandler);
                obj.on('transition', moTransitionHandler);

                obj.makeElement(function() {
                    obj.onReady(function() {
                        if (obj instanceof ImageMediaObject || obj instanceof TextMediaObject) {
                            addStyle(obj.element, style);
                            stageElement.appendChild(obj.element);
                            placeAtRandomPosition(obj.element); //CAN ADD STYLE LIKE IN THIS METHOD
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

    function addStyle(element, style) {
        _.forEach(Object.keys(style), function(styleKey) {
            element.style[styleKey] = style[styleKey];
        });
    }

    this.setMediaObjectQueue = function(newQueue) {
        queue = newQueue;
    };

    function moDoneHandler (mediaObject) {
        mediaObject.removeListener('done', moDoneHandler);
        if (mediaObject.element) {
            if (mediaObject.element.parentElement === stageElement) {
                stageElement.removeChild(mediaObject.element);
            } else {
                console.log('mediaObject.element is not currently on the stage, should not have triggered moDoneHandler');
                console.log('element parent is ', mediaObject.element.parentElement);
            }
        } else {
            console.log('moDoneHandler called on mediaObject without element, shouldnt happen....');
        }
        showMedia();
    }

    function moTransitionHandler (mediaObject) {
        mediaObject.removeListener('transition', moTransitionHandler);
        // sometimes things can still be loading so, make sure there's an element
        if (mediaObject.element) {
            mediaObject.element.classList.remove('show-media-object');
        }
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
