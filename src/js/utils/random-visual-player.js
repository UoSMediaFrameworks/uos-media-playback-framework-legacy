'use strict';
/* jshint browser:true */
var _ = require('lodash');
var VideoMediaObject = require('./media-object/video-media-object');
var variableThrottle = require('./variable-throttle');
var ImageMediaObject = require('./media-object/image-media-object');
var TextMediaObject = require('./media-object/text-media-object');


function RandomVisualPlayer(stageElement, queue) {
    var showMedia = variableThrottle(function () {
        removeAllLooplessVideos();
        _.forEach([VideoMediaObject, ImageMediaObject, TextMediaObject], function (moType) {
            var obj = queue.take([moType]);
            if (obj) {
                obj.on('done', moDoneHandler);
                obj.on('transition', moTransitionHandler);

                obj.makeElement(function () {
                    obj.onReady(function () {

                        if (obj instanceof ImageMediaObject || obj instanceof TextMediaObject) {
                            stageElement.appendChild(obj.element);
                            placeAtRandomPosition(obj.element);
                        }
                        obj.element.onclick = bringToFront;

                        obj.play();
                        obj.element.classList.add('show-media-object');
                    });

                    if (obj instanceof VideoMediaObject) {
                        if(obj._obj.autoreplay == 0){obj.element.classList.add('interval-remove');}
                        window.addEventListener('blur',function(){
                            bringToFront('',document.activeElement)
                        });
                        stageElement.appendChild(obj.element);
                        placeAtRandomPosition(obj.element);
                    }
                });
            }
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


        return Math.round(randomNonOverlapPosition + potentialOverlap) + 'px';
    }

    function removeAllLooplessVideos() {
        var removable = document.getElementsByClassName('interval-remove');
        while (removable[0]) {
            removable[0].parentNode.removeChild(removable[0]);
        }
    }

    function placeAtRandomPosition(element) {
        element.style.left = calcDimension('clientWidth', element);
        element.style.top = calcDimension('clientHeight', element);
    }
    //Unused
    this.setMediaObjectQueue = function (newQueue) {
        queue = newQueue;
    };

    function clearMediaElement(mediaObject) {
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
    //Improve Done Handler AP.
    function moDoneHandler(mediaObject) {
        if (mediaObject.type == "video") {
            switch (mediaObject._obj.autoreplay) {
                case 0:
                   console.log('i need a better way to do this')
                    break;
                case 1:
                    clearMediaElement(mediaObject);
                    break;
                default:
                    if (mediaObject.currentLoop == undefined) {
                        mediaObject.currentLoop = 0;
                    } else if (mediaObject.currentLoop < mediaObject.autoreplay) {
                        console.log(mediaObject.currentLoop);
                        mediaObject.currentLoop++;
                    } else {
                        clearMediaElement(mediaObject);
                    }

                    break;

            }
        }else{
            clearMediaElement(mediaObject);
        }

    }

    function moTransitionHandler(mediaObject) {
        mediaObject.removeListener('transition', moTransitionHandler);
        // sometimes things can still be loading so, make sure there's an element
        if (mediaObject.element && mediaObject.autoreplay <=1) {
            mediaObject.element.classList.remove('show-media-object');
        }
        showMedia();
    }

    this.start = function () {
        showMedia();
        if (queue.displayInterval) {
            window.setInterval(showMedia, queue.displayInterval);
        }
    };
}

module.exports = RandomVisualPlayer;
