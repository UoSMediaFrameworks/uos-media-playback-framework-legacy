'use strict';
/* jshint browser:true */
var _ = require('lodash');
var TagMatcher = require('./tag-matcher');
var TemporalMediaObject = require('./media-object/temporal-media-object');
var AtemporalMediaObject = require('./media-object/atemporal-media-object');
var VideoMediaObject = require('./media-object/video-media-object');
var ImageMediaObject = require('./media-object/image-media-object');
var TextMediaObject = require('./media-object/temporal-media-object');


function RandomVisualPlayer (stageElement, queue) {

    function calcDimension(dim, element) {
        return Math.round(Math.random() * (stageElement[dim] - element[dim])) + 'px';
    }

    function placeAtRandomPosition(element) {
        element.style.left = calcDimension('clientWidth', element);
        element.style.top = calcDimension('clientHeight', element);
    }

    /*
    // handles intelligent per type behavior for mediaObjects, dispatching to the proper methods for 
    // their display
    function showElementsOfType (mediaObjectType) {
        var displayDuration;
        if (getTypeCount(mediaObjectType) < queue.maximumTypeCounts[mediaObjectType]) {
            
            var obj = queue.take(mediaObjectType);

            if (obj) {
                incrementTypeCount(mediaObjectType);

                obj.makeElement(function(el) {
                    obj.onReady(function() {
            
                        var cleanUp = function() {
                            el.classList.remove('show-media-object');
                            decrementTypeCount(mediaObjectType);
                            queue.give(obj);
                            showElementsOfType(mediaObjectType);
                            
                            window.setTimeout(function() {
                                stageElement.removeChild(el);
                            }, 1400);
                        };

                        if (obj instanceof AtemporalMediaObject) {
                            window.setTimeout(function() {
                                el.classList.add('show-media-object');
                            }, 0);

                            window.setTimeout(cleanUp, queue.displayDuration * 1000);
                        } else if (obj instanceof TemporalMediaObject) {
                            obj.play();
                            el.classList.add('show-media-object');
                            obj.onFinish(function() {
                                // activeTemporalElements.splice(activeTemporalElements.indexOf(obj), 1);
                                cleanUp();
                            });
                        }


                    });

                    stageElement.appendChild(el);
                    placeAtRandomPosition(el);
                });

                var delay;
                if (obj instanceof AtemporalMediaObject) {
                    delay = queue.displayDuration / queue.maximumTypeCounts[mediaObjectType];
                } else if (obj instanceof TemporalMediaObject) {
                    delay = queue.displayInterval;
                    // activeTemporalElements.push(obj);
                }

                setTimeout(function() {
                    showElementsOfType(mediaObjectType);    
                }, delay * 1000);
                
                switch(mediaObjectType) {
                    case 'image':
                        displayDuration = queue.displayDuration * 1000;
                        obj.makeElement(function(el) {

                            stageElement.appendChild(el);
                            placeAtRandomPosition(el);
                            
                            window.setTimeout(function() {
                                el.classList.add('show-media-object');
                            }, 0);

                            window.setTimeout(function() {
                                el.classList.remove('show-media-object');
                                decrementTypeCount(mediaObjectType);
                                showElementsOfType(mediaObjectType);

                                window.setTimeout(function () {
                                    stageElement.removeChild(el);
                                }, 1400);
                            }, displayDuration);
                        });
                        break;

                    case 'text':
                        // displayDuration = queue.displayDuration * 1000;
                        // elementManager.showText(obj.text, displayDuration, function() {
                        //     decrementTypeCount(mediaObjectType);
                        //     showElementsOfType(mediaObjectType);
                        // });
                        break;

                    case 'video':
                        obj.makeElement(function(el) {
                            obj.onReady(function() {
                                el.classList.add('show-media-object');
                                obj.play();

                                obj.onFinish(function() {
                                    el.classList.remove('show-media-object');
                                    decrementTypeCount(mediaObjectType);
                                    showElementsOfType(mediaObjectType);
                                    
                                    window.setTimeout(function() {
                                        stageElement.removeChild(el);
                                    }, 1400);
                                });
                            });

                            stageElement.appendChild(el);
                            placeAtRandomPosition(el);

                        });
                        // displayDuration = 3 * 1000;
                        // elementManager.playVideo(obj.url, obj.volume || 0, function() {
                        //     decrementTypeCount(mediaObjectType);
                        //     showElementsOfType(mediaObjectType);
                        // });
                        break;

                    case 'audio':
                        // displayDuration = 3 * 1000;
                        // elementManager.playAudio(obj.url, obj.volume || 100, function() {
                        //     decrementTypeCount(mediaObjectType);
                        //     showElementsOfType(mediaObjectType);
                        // });
                        break;
                }

                
            }  
        }  
    }
    */
  

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

    var showMedia = _.throttle(function () {
        var obj = queue.take([VideoMediaObject, ImageMediaObject]);
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
    }, queue.displayInterval,{trailing: true});

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