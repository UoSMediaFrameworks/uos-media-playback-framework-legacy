'use strict';
/* jshint browser:true */
var _ = require('lodash');
var TagMatcher = require('./tag-matcher');
var TemporalMediaObject = require('./media-object/temporal-media-object');
var AtemporalMediaObject = require('./media-object/atemporal-media-object');


function RandomVisualPlayer (stageElement, queue) {
    var tagMatcher = new TagMatcher(),
        // total number of active items being displayed
        typeCounts = {},
        activeTemporalElements = [];

    function calcDimension(dim, element) {
        return Math.round(Math.random() * (stageElement[dim] - element[dim])) + 'px';
    }

    function placeAtRandomPosition(element) {
        element.style.left = calcDimension('clientWidth', element);
        element.style.top = calcDimension('clientHeight', element);
    }

    // handles intelligent per type behavior for mediaObjects, dispatching to the proper methods for 
    // their display
    function showElementsOfType (mediaObjectType) {
        var displayDuration;
        if (getTypeCount(mediaObjectType) < queue.maximumTypeCounts[mediaObjectType]) {
            
            var obj = queue.take(mediaObjectType, tagMatcher);

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
                                activeTemporalElements.splice(activeTemporalElements.indexOf(obj), 1);
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
                    activeTemporalElements.push(obj);
                }

                setTimeout(function() {
                    showElementsOfType(mediaObjectType);    
                }, delay * 1000);
                /*
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
                }*/

                
            }  
        }  
    }

    function incrementTypeCount (type) {
        if (typeCounts[type]) {
            typeCounts[type] += 1;
        } else {
            typeCounts[type] = 1;
        }
    }

    function decrementTypeCount (type) {
        typeCounts[type] -= 1;
    }

    function getTypeCount(type) {
        return typeCounts[type] || 0;
    }

    this.setMediaObjectQueue = function(newQueue) {
        queue = newQueue;
    };

    this.start = function() {
        _.forEach(['video', 'image', 'text'], function(type) {
            showElementsOfType(type);
        });
    };

    this.setTagMatcher = function(newTagMatcher) {
        // verify that all currently playing audio tracks match the tagMatcher,
        // if not cancel them and start new ones
        if (! tagMatcher.equalTo(newTagMatcher) ) {
            tagMatcher = newTagMatcher;
            
        }
    };

}

module.exports = RandomVisualPlayer;