var React = require('react');
var MediaObject = require('../viewer/models/media-object.jsx');
var _ = require('lodash');
var VideoMediaObject = require('../../utils/media-object/video-media-object');
var ImageMediaObject = require('../../utils/media-object/image-media-object');
var TextMediaObject = require('../../utils/media-object/text-media-object');
var AudioMediaObject = require('../../utils/media-object/audio-media-object');
var hat = require('hat');

var RandomVisualPlayer = React.createClass({

    // APEP allow us to keep track of unmounting incase we have any transitioning media
    isUmounting: false,

    getInitialState: function () {
        return {
            queue: [],
            arr: [],
            mediaQueue: {},
            interval: false,
            loadMediaObjectInterval: null,
            style: {}
        };
    },

    loadMediaObject: function (queue) {
        var self = this;
        try {
            var objs = queue.mediaQueue.take([VideoMediaObject, ImageMediaObject, TextMediaObject, AudioMediaObject]);

            _.forEach(objs, function(obj){
                if (obj !== undefined) {
                    obj.guid = obj.guid || hat();
                    self.state.arr.push(obj);
                }
            });

            //APEP Setting state will trigger a new render, with a new render preview will be unmounted/mounted
            self.setState({mediaQueue: self.props.mediaQueue, arr: self.state.arr});
        } catch (e) {
            console.log("rsvp error", e)
        }
    },

    moDoneHandler: function (mediaObject) {
        //console.log("randomVisualPlayer - moDoneHandler - mediaObject: ", mediaObject.props.data.mediaObject);

        // APEP for any non video type media, we can similarly clear the video media object
        this.clearMediaObject(mediaObject);

        // APEP if queue is in linear mode, check to see if we should change buckets or not.
        // if queue is linear and queue && isLinearQueueEmpty we should take and reset timer
        // the linear queue and mode is responsible for allowing the player to request media earlier than the
        // scene duration, this is toggled inside the Scene JSON
        if(this.props.mediaQueue && this.props.mediaQueue.isLinear) {
            console.log("moDoneHandler - isLinear");
            if(this.props.mediaQueue.isLinearQueueEmpty() && !this.isUmounting) {
                console.log("moDoneHandler - linearQueue allowing the next linear bucket to be take early");
                this.props.mediaQueue.linearMediaObjectQueue.nextBucket();
                this.startLoadMediaObjectsInterval();
            }
        }
    },

    cueMoDoneHandler: function (mediaObject) {
        console.log("randomVisualPlayer - cueMoDoneHandler - mediaObject: ", mediaObject.props.data.mediaObject);

        // APEP currently not sure what is most suitable for done from this process
        if(this.props.cueMediaObjectDoneHandler)
            this.props.cueMediaObjectDoneHandler(mediaObject.props.data.mediaObject.guid);
    },

    clearMediaObject: function (mediaObject) {
        var arr = this.state.arr;

        var previous = arr.length;

        _.remove(arr, function (currentObject) {
            return currentObject.guid === mediaObject.props.data.mediaObject.guid;
        });

        var now = arr.length;

        if (previous === now) {
            console.log("RandomVisualPlayer - clearMediaObject - PREVIOUS AND NOW THE SAME - potential issue");
        } else {
            this.props.mediaQueue.moTransitionHandler(mediaObject.props.data.mediaObject);
            this.props.mediaQueue.moDoneHandler(mediaObject.props.data.mediaObject);
            console.log("clearMediaObject - REMOVED : ", mediaObject.props.data.mediaObject);
        }

        // console.log("RandomVisualPlayer - clearMediaObject - previous, now: ", previous, now);

        this.setState({arr: arr});
    },

    shouldComponentUpdate(nextProps, nextState){
        var stateUpdate = this.state === nextState;
        var propsUpdate = this.props === nextProps;
        var intervalUpdate = this.state.interval === nextState.interval;

        var willUpdate;

        if (!intervalUpdate) {
            willUpdate = false;
        } else if (!propsUpdate) {
            willUpdate = true
        } else if (!stateUpdate) {
            willUpdate = true;
        }

        return willUpdate;
    },

    componentDidMount: function () {
        this.props.mediaQueue.setTransitionHandler(this.mediaObjectTransition);
    },

    // APEP function given to the media queue object to provide object transition out functionality
    mediaObjectTransition: function (mediaObject) {

        // console.log("mediaObjectTransition - mediaObjectTransition - this.state.arr.length: ", this.state.arr.length);
        try {
            // APEP find the ref media object created from arr.map to queue in render function
            // This gives us the react component required to transition
            var reactMediaObject = this.refs[mediaObject.guid];

            if (reactMediaObject) {
                // console.log("mediaObjectTransition - mediaObjectTransition - reactMediaObject - transitioning: ", reactMediaObject);

                //APEP get the non generic Object and call transition (true is an opts flag for override looping)
                reactMediaObject.getObject().transition(true);
            } else {
                // console.log("mediaObjectTransition - found reactComponentMediaObject for done - error: ", reactComponentMediaObject);

                // APEP without the correct reference, the minimum we can do if force the media object to be removed
                // APEP TODO check if the below should be calling the doneHandler with mediaObject, rather than ReactMediaObject
                this.moDoneHandler(reactMediaObject);
            }
        } catch (e) {
            console.log("FAILED TO TRANSITION MEDIA OBJECT E: ", e);
        }

    },

    // APEP If the player is removed from the grid we must clear the interval
    componentWillUnmount: function() {

        this.isUmounting = true;

        clearInterval(this.state.loadMediaObjectInterval);

        // APEP we need to force clear all children because if the user is unmounting the component
        // APEP we cannot wait for everything to clean up after itself
        var self = this;
        _.forEach(this.state.arr, function(mediaOnScreen) {
            self.mediaObjectTransition(mediaOnScreen);
        });

        _.forEach(this.props.cuePointMediaObjects, function(cuePointMediaOnScreen){
            self.mediaObjectTransition(cuePointMediaOnScreen);
        });
    },

    startLoadMediaObjectsInterval: function() {
        console.log("startLoadMediaObjectsInterval - startLoadMediaObjectsInterval");

        if(this.state.loadMediaObjectInterval)
            clearInterval(this.state.loadMediaObjectInterval);

        this.loadMediaObject(this.props);

        var self = this;

        var interval = setInterval(function () {
            self.loadMediaObject(self.props)
        }, self.props.mediaQueue.getDisplayInterval());

        this.setState({loadMediaObjectInterval: interval});
    },

    componentDidUpdate: function () {
        //TODO APEP I think we may need to clean up the existing media if we update with a new scene
        var self = this;
        // APEP if we update - transition media or get queues media that has been removed
        try {
            this.props.mediaQueue.setTransitionHandler(this.mediaObjectTransition);
            if (self.props.mediaQueue.getDisplayInterval() !== undefined && !self.state.interval) {
                self.startLoadMediaObjectsInterval();

                self.setState({interval: true});
            }
        } catch (e) {
            console.log("RVP - didUpdateError - e: ", e);
        }
    },

    render: function () {

        var self = this;

        // APEP refactored to avoid async issues
        var q = self.state.arr.map(function (mediaObject, index) {
            var data = {
                mediaObject: mediaObject,
                player: self.refs.player,
                //Attach the done handler using react props
                moDoneHandler: self.moDoneHandler,
                // APEP we may want to assign below [displayDuration, transitionDuration] within mediaObject these within the state.arr push.
                // It's something we need to see if this change of props would cause any of the media objects to update when we might
                // not want them to update.
                displayDuration: self.props.mediaQueue.getDisplayDuration(),
                transitionDuration: self.props.mediaQueue.getTransitionDuration(),
                triggerMediaActiveTheme: self.props.triggerMediaActiveTheme,
                key: index
            };

            return (
                <MediaObject ref={mediaObject.guid} key={mediaObject.guid} data={data} />
            );
        });

        var cueMediaObjects = self.props.cuePointMediaObjects.map(function(mediaObject, index) {
            var data = {
                mediaObject: mediaObject,
                player: self.refs.player,
                //Attach the done handler using react props
                moDoneHandler: self.cueMoDoneHandler,
                displayDuration: self.props.mediaQueue.getDisplayDuration(),
                transitionDuration: self.props.mediaQueue.getTransitionDuration(),
                triggerMediaActiveTheme: self.props.triggerMediaActiveTheme,
                key: mediaObject.guid
            };

            return (
                <MediaObject ref={mediaObject.guid} key={mediaObject.guid} data={data} />
            );
        });

        return (
            <div className="player" ref="player" style={this.props.sceneStyle}>
                {q}
                {cueMediaObjects}
                {this.props.children}
            </div>
        );
    }

});

module.exports = RandomVisualPlayer;
