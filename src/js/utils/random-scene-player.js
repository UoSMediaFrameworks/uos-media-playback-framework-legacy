'use strict';
/* jshint browser:true */
var _ = require('lodash');
var TagMatcher = require('./tag-matcher');
var TemporalMediaObject = require('./media-object/temporal-media-object');
var AtemporalMediaObject = require('./media-object/atemporal-media-object');

// types and their default display counts
var MEDIA_TYPES = {
    image: 3,
    text: 1,
    video: 1,
    audio: 1
};

var DEFAULT_STATIC_DISPLAY_DURATION = 10;
var DEFAULT_DISPLAY_INTERVAL = 3;

function RandomScenePlayer (stageElement) {
    var queue, 
        scene,
        playing = false,
        tagMatcher = new TagMatcher(),
        // total number of active items being displayed
        typeCounts = {};

    function showNewMedia () {
        _.chain(MEDIA_TYPES).keys().forEach(function(type) {
            showElementsOfType(type);
        });
    }

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
        if (getTypeCount(mediaObjectType) < getMaximumTypeCount(mediaObjectType)) {
            
            var obj = queue.nextByType(mediaObjectType);

            if (obj) {
                incrementTypeCount(mediaObjectType);

                obj.makeElement(function(el) {
                    obj.onReady(function() {
                        el.classList.add('show-media-object');
                        
                        var cleanUp = function() {
                            el.classList.remove('show-media-object');
                            decrementTypeCount(mediaObjectType);
                            showElementsOfType(mediaObjectType);
                            
                            window.setTimeout(function() {
                                stageElement.removeChild(el);
                            }, 1400);
                        };

                        if (obj instanceof AtemporalMediaObject) {
                            // window.setTimeout(function() {
                                el.classList.add('show-media-object');
                            // }, 0);

                            window.setTimeout(cleanUp, getDisplayDuration(scene, obj) * 1000);
                        } else if (obj instanceof TemporalMediaObject) {
                            obj.play();

                            obj.onFinish(cleanUp);
                        }


                    });

                    stageElement.appendChild(el);
                    placeAtRandomPosition(el);
                });

                var delay;
                if (obj instanceof AtemporalMediaObject) {
                    delay = getDisplayDuration() / getMaximumTypeCount(mediaObjectType);
                } else if (obj instanceof TemporalMediaObject) {
                    delay = getDisplayInterval();
                }

                setTimeout(function() {
                    showElementsOfType(mediaObjectType);    
                }, delay * 1000);
                /*
                switch(mediaObjectType) {
                    case 'image':
                        displayDuration = getDisplayDuration(scene, obj) * 1000;
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
                        // displayDuration = getDisplayDuration(scene, obj) * 1000;
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

    function filterMediaScene(tagMatcher, mediaType) {
        return _.filter(scene.scene, function (obj) {
            return (! mediaType || obj.type === mediaType) && tagMatcher.match(obj.tags);
        });
    }

    // if there's room in the scene, 
    // return the next media object from the _displayQueue.  Refill the queue if needed
    function nextMediaObject (type) {
        if (getTypeCount(type) < getMaximumTypeCount(type)) {
            return queue.nextByType(type);
        }
    }

    function parseTagString (tagString) {
        return _.uniq(_.map(tagString.split(','), function(s) { return s.trim(); }));
    }

    

    function getMaximumTypeCount(type) {
        var maximum,
            defaultCount = MEDIA_TYPES[type];
        // wrap in try catch incase attribute is missing from the json
        try {
            maximum = parseInt(scene.maximumOnScreen[type]);
        } catch (e) {
            if (e instanceof TypeError) {
                // do nothing, this just means there is no specified maximumOnScreen object in the scene
                // we just go with the default then
            } else {
                throw e;
            }
        } finally {
            if (isNaN(maximum)){
                maximum = defaultCount;
            }
            return maximum;
        }
    }

    function getDisplayInterval () {    
        var val = parseFloat(scene.displayInterval);
        
        if (isNaN(val)) {
            val = DEFAULT_DISPLAY_INTERVAL;
        }
        
        return val;
    }

    function getDisplayDuration () {
        // be gentle on the poor user, parse if needed
        var duration = parseFloat(scene.displayDuration);

        if (isNaN(duration)) {
            duration = DEFAULT_STATIC_DISPLAY_DURATION;
        }

        return duration;
    }

    this.setMediaObjectQueue = function(newQueue) {
        queue = newQueue;
    };

    this.setScene = function(newScene) {
        scene = _.cloneDeep(newScene);

        // best to parse the tag string up front, rather than every time a new media object is selected
        _.forEach(scene.scene, function(mediaObject) {
            mediaObject.tags = parseTagString(mediaObject.tags);
        });

        

        if (playing) {
            showNewMedia();
        }
    };

    this.start = function() {
        if (! playing) {
            playing = true;
            
            showNewMedia();
        }
    };

}

module.exports = RandomScenePlayer;