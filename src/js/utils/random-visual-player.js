'use strict';
/* jshint browser:true */
var _ = require('lodash');
var VideoMediaObject = require('./media-object/video-media-object');
var ImageMediaObject = require('./media-object/image-media-object');
var TextMediaObject = require('./media-object/text-media-object');


function RandomVisualPlayer (stageElement, queue) {

    
    var showMediaLastRun;
    function showMedia() {
        // only execute every queue.displayInterval
        var now = new Date().getTime();
        var run = false;
        if (showMediaLastRun) {
            var elapsed = now - showMediaLastRun;
            if (elapsed > queue.displayInterval) {
                run = true;
                showMediaLastRun = now;
            } else {
                // delay till we reach the displayInterval
                setTimeout(showMedia, queue.displayInterval - elapsed);
            }
        } else {
            showMediaLastRun = now;
            run = true;
        }

        if (run) {
            var obj = queue.take([VideoMediaObject, ImageMediaObject, TextMediaObject]);
            if (obj) {
                obj.on('done', moDoneHandler);
                obj.on('transition', moTransitionHandler);

                obj.makeElement(function() {
                    obj.onReady(function() {
                        if (obj instanceof ImageMediaObject || obj instanceof TextMediaObject) {
                            stageElement.appendChild(obj.element);
                            placeAtRandomPosition(obj.element);
                        }

                        obj.play({
                            transitionDuration: queue.transitionDuration,
                            // only applicable to atemporal media (images and text)
                            displayDuration: queue.displayDuration
                        });
                        obj.element.classList.add('show-media-object');
                    });

                    if (obj instanceof VideoMediaObject) {
                        stageElement.appendChild(obj.element);
                        placeAtRandomPosition(obj.element);    
                    }
                    
                });
            }    
        }
    }

    function calcDimension(dim, element) {
        return Math.round(Math.random() * (stageElement[dim] - element[dim])) + 'px';
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
        // _.forEach(['video', 'image', 'text'], function(type) {
        //     showElementsOfType(type);
        // });
        showMedia();

        if (queue.displayInterval) {
            window.setInterval(showMedia, queue.displayInterval);
        }
    };
}

module.exports = RandomVisualPlayer;