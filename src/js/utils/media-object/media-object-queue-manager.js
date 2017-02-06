/**
 * Created by aaronphillips on 05/02/2017.
 */
var RandomMediaObjectQueue = require('./media-object-queue');
var LinearMediaObjectQueue = require('./media-object-linear-queue');

var IS_LINEAR_SEQUENCE_BY_NUMBER = "sequenceByNumber";

// APEP I think we need to take a func in the constructor, something to call when a queue changes
function MediaObjectQueueManager(types, defaultDisplayCounts, afterQueueChangeFunc) {

    // APEP TODO update both constructors to take a manager instance
    this.randomMediaObjectQueue = new RandomMediaObjectQueue(types, defaultDisplayCounts, this);
    this.linearMediaObjectQueue = new LinearMediaObjectQueue(types, defaultDisplayCounts, this);

    this.activeQueue = this.linearMediaObjectQueue;
    this.afterQueueChangeFunc = afterQueueChangeFunc;

    this.take = function(args) {
        if (this.activeQueue) {
            return this.activeQueue.take(args);
        } else {
            return [];
        }
    };

    this.getQueue = function() {
        if (this.activeQueue) {
            return this.activeQueue.getQueue();
        }
    };

    this.setScene = function(newScene, ops) {
        try {
            this.randomMediaObjectQueue.setScene(newScene, ops);
        } catch (e) {
            console.log("MediaObjectQueueManager - randomMediaObjectQueue - setScene error: ", e);
        }
        try {
            this.linearMediaObjectQueue.setScene(newScene, ops);
        }  catch (e) {
            console.log("MediaObjectQueueManager - linearMediaObjectQueue - setScene error: ", e);
        }

        // APEP toggle the active scene based on the Scene JSON
        if(newScene.hasOwnProperty("isLinear") && newScene.isLinear === IS_LINEAR_SEQUENCE_BY_NUMBER) {
            // APEP if the Scene JSON contains the isLinear property and is marked as sequenceByNumber we can use the linear queue
            // APEP In the future we are looking to implement sequenceByTime, and this will have to change
            this.setActiveQueue(true);
        } else {
            this.setActiveQueue(false);
        }

        // APEP the isLinearOptions define the behaviour of the linear Playback
        if(newScene.hasOwnProperty("isLinearOptions")) {
            // APEP designed potential values playOnlySequencedMedia||playRemainingMedia||playAllMedia
            var isLinearOption = newScene.isLinearOptions;
            // APEP for now we only support either sequence only or play all media
            var isValid = isLinearOption ===  "playOnlySequencedMedia" || isLinearOption === "playAllMedia";
            if(isValid) {
                this.linearMediaObjectQueue.setIsLinearOption(isLinearOption);
            }
        }
    };

    this.setTagMatcher = function(newTagMatcher) {
        try {
            this.randomMediaObjectQueue.setTagMatcher(newTagMatcher);
        } catch (e) {
            console.log("MediaObjectQueueManager - randomMediaObjectQueue - setTagMatcher error: ", e);
        }
        try {
            this.linearMediaObjectQueue.setTagMatcher(newTagMatcher);
        }  catch (e) {
            console.log("MediaObjectQueueManager - linearMediaObjectQueue - setTagMatcher error: ", e);
        }
    };

    this.displayInterval = this.activeQueue.displayInterval; // || 10000; //this.linearMediaObjectQueue.displayInterval;
    this.displayDuration = this.activeQueue.displayDuration; // || 4000; //this.linearMediaObjectQueue.displayDuration;
    this.transitionDuration = this.activeQueue.transitionDuration; //|| 1400; //this.linearMediaObjectQueue.transitionDuration;

    this.getDisplayInterval = function() {
        return this.activeQueue.displayInterval;
    };

    this.getDisplayDuration = function() {
        return this.activeQueue.displayDuration;
    };

    this.getTransitionDuration = function() {
        return this.activeQueue.transitionDuration;
    };

    this.setTransitionHandler = function(funct) {
        this.activeQueue.setTransitionHandler(funct);
    };

    this.moTransitionHandler = function(mediaObject) {
        this.activeQueue.moTransitionHandler(mediaObject);
    };

    this.moDoneHandler = function(mediaObject) {
        this.activeQueue.moDoneHandler(mediaObject);
    };

    this.setActiveQueue = function(isLinear) {
        if(isLinear) {
            this.activeQueue = this.linearMediaObjectQueue;
        } else {
            this.activeQueue = this.randomMediaObjectQueue;
        }
    };

    this.transitionFromLinear = function() {
        console.log("MediaObjectQueueManager - transitionFromLinear - called");

        this.setActiveQueue(false);

        if(this.afterQueueChangeFunc) {
            console.log("queueChangeFunc");
            this.afterQueueChangeFunc();
        }
    };

    this.transitionFromRandom = function() {
        console.log("MediaObjectQueueManager - transitionFromRandom - called");

        this.setActiveQueue(true);

        if(this.afterQueueChangeFunc) {
            this.afterQueueChangeFunc();
        }
    }

}

module.exports = MediaObjectQueueManager;
