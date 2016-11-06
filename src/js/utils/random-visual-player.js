'use strict';
/* jshint browser:true */
var _ = require('lodash');
var VideoMediaObject = require('./media-object/video-media-object');
var variableThrottle = require('./variable-throttle');
var ImageMediaObject = require('./media-object/image-media-object');
var TextMediaObject = require('./media-object/text-media-object');
var toastr = require('toastr');

var looplessMediaObjects = [];

function RandomVisualPlayer(stageElement, queue) {

    var showMedia = variableThrottle(function () {

        removeAllLooplessVideos(); //Causing some issues with playback

        _.forEach([VideoMediaObject, ImageMediaObject, TextMediaObject], function (moType) {
            var obj = queue.take([moType]);

            var style = obj ? obj.style : {};

            if (!obj) {
                return;
            }

            obj.on('done', moDoneHandler);
            obj.on('transition', moTransitionHandler);

            obj.makeElement(function () {

                //TODO improve
                if (obj instanceof VideoMediaObject) {
                    try {
                        if (obj.autoreplay == 0) {
                            obj._player._element.classList.add('interval-remove');
                            looplessMediaObjects.push(obj);
                        }
                        window.addEventListener('blur', function () {
                            bringToFront('', document.activeElement)
                        });

                        stageElement.appendChild(obj._player._element);
                        placeAtRandomPosition(obj._player._element);
                        obj._player._element.classList.add('show-media-object');
                        obj.play();
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    obj.onReady(function () {

                        if (obj instanceof ImageMediaObject || obj instanceof TextMediaObject) {
                            addStyle(obj.element, style);
                            stageElement.appendChild(obj.element);
                            placeAtRandomPosition(obj.element);
                        }
                        obj.element.onclick = bringToFront;

                        obj.play();
                        obj.element.classList.add('show-media-object');
                    });
                }
            });

        });

    }, function () {
        return queue.displayInterval;
    });

    function bringToFront(e,target){
        var children = stageElement.childNodes;
        children.forEach(function(el){
            el.style.zIndex = 1;
        });
        if(target){
            //in the case of Iframe
            target.style.zIndex = 999;
        }else{
            //for all other cases
            e.target.style.zIndex = 999;
        }
    }
    function calcDimension(dim, element) {
        var elementDimensionSize = element[dim];

        var randomNonOverlapPosition = Math.random() * (stageElement[dim] - elementDimensionSize);
        // allow potential overlap of up to 30% of element's dimension
        var potentialOverlap = _.random(-0.3, 0.3) * elementDimensionSize;
        var finalPosition = Math.round(randomNonOverlapPosition + potentialOverlap);
        if (finalPosition <= stageElement[dim] && finalPosition >= 0) {
            return finalPosition + 'px';
        } else if (finalPosition > stageElement[dim]) {
            return stageElement[dim] + 'px';
        } else {
            return 0 + 'px';
        }


        return Math.round(randomNonOverlapPosition + potentialOverlap) + 'px';
    }

    function removeAllLooplessVideos() {

        var i = looplessMediaObjects.length;

        while(i--) {
            var mediaObject = looplessMediaObjects.splice(i , 1);

            if(!mediaObject || mediaObject.length <= 0)
                return;

            if(mediaObject[0] instanceof VideoMediaObject) {
                mediaObject[0].transition();
            }
        }

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

    function clearMediaElement(mediaObject) {

        console.log("randomVisualPlayer - clearMediaElement - mediaObject", mediaObject);

        mediaObject.removeListener('done', moDoneHandler);

        //As video element is part of the media object, we must parse the media object different to get the HTML element
        var elementForRemoval = mediaObject.type === "video" ? mediaObject._player._element : mediaObject.element;

        if (elementForRemoval) {
            if (elementForRemoval.parentElement === stageElement) {
                stageElement.removeChild(elementForRemoval);
            } else {
                console.log('mediaObject.element is not currently on the stage, should not have triggered moDoneHandler');
                console.log('element parent is ', elementForRemoval.parentElement);
            }
        } else {
            toastr.warning('There has been an issue with the system.');
            console.log('moDoneHandler called on mediaObject without element, shouldnt happen....');
        }
        showMedia();
    }

    function vmoDoneHandler(videoMediaObject) {

        if(videoMediaObject.autoreplay === 0 || videoMediaObject.autoreplay === 1) {
            videoMediaObject.transition();
            clearMediaElement(videoMediaObject);
            return;
        }

        if (videoMediaObject.currentLoop == undefined) {
            videoMediaObject.currentLoop = 1;

            //TODO if not vimeo
            videoMediaObject.play();
        } else if (videoMediaObject.currentLoop < videoMediaObject.autoreplay) {
            console.log("CurrentLoop: ", videoMediaObject.currentLoop);
            videoMediaObject.currentLoop++;


            //TODO if not vimeo
            videoMediaObject.play();
        } else {

            videoMediaObject.currentLoop = 0;
            videoMediaObject.transition(); //causing some issues
            clearMediaElement(videoMediaObject);
        }
    }

    //Improve Done Handler AP.
    function moDoneHandler(mediaObject) {

        console.log("randomVisualPlayer - moDoneHandler - mediaObject: ", mediaObject);

        if (mediaObject.type !== "video") {
            clearMediaElement(mediaObject);
            return;
        }

        vmoDoneHandler(mediaObject);
    }

    function moTransitionHandler(mediaObject) {
        mediaObject.removeListener('transition', moTransitionHandler);

        //As video element is part of the media object, we must parse the media object different to get the HTML element
        var elementForTransition = mediaObject.type === "video" ? mediaObject._player._element : mediaObject.element;

        console.log("randomVisualPlayer - moTransitionHandler - mediaObject: ", mediaObject);

        // sometimes things can still be loading so, make sure there's an element
        if (elementForTransition) {
            if(mediaObject.type !== "video")
                elementForTransition.classList.remove('show-media-object');
            else if (mediaObject.type === "video" && mediaObject.autoreplay <=1)
                elementForTransition.classList.remove('show-media-object');
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
