var React = require('react');
var MediaObject = require('../viewer/models/media-object.jsx');
var lodash = require('lodash');
var VideoMediaObject = require('../../utils/media-object/video-media-object');
var ImageMediaObject = require('../../utils/media-object/image-media-object');
var TextMediaObject = require('../../utils/media-object/text-media-object');
var AudioMediaObject = require('../../utils/media-object/audio-media-object');
var hat = require('hat');

var RandomVisualPlayer = React.createClass({
    getInitialState: function () {
        return {
            queue: [],
            arr: [],
            mediaQueue: {},
            interval: false,
            loadMediaObjectInterval: null
        };
    },

    // APEP TODO view event so store can update queue, and using change emitted update this component
    loadMediaObject: function (queue) {
        var self = this;
        try {
            var objs = queue.mediaQueue.take([VideoMediaObject, ImageMediaObject, TextMediaObject, AudioMediaObject]);

            lodash.forEach(objs, function(obj){
                if (obj !== undefined) {
                    obj.guid = obj.guid || hat();
                    self.state.arr.push(obj);
                }
            });

            //APEP Setting state will trigger a new render, with a new render components will be unmounted/mounted
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
            if(this.props.mediaQueue.isLinearQueueEmpty()) {
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

    // APEP TODO we should use a view action so the queue is gets updated and the update results trickles through
    clearMediaObject: function (mediaObject) {
        var arr = this.state.arr;

        var previous = arr.length;

        lodash.remove(arr, function (currentObject) {
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
        var intervalUpdate = this.state.interval == nextState.interval;

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

    componentWillMount: function () {
    },

    componentDidMount: function () {
        // APEP TODO we should not need this
        this.props.mediaQueue.setTransitionHandler(this.mediaObjectTransition);
    },

    // APEP function given to the media queue object to provide object transition out functionality
    // APEP TODO this could be used in the arr to queue.active comparison
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

    // APEP TODO We need to update the interval, so a view action is created so the queue can add something new to the active list in the queue
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


    // APEP TODO I'm thinking here, we should compare arr to the queue.active from the store
    // Anything in arr and not in queue.active, we should transition/done the media element
    // Anything in queue.active that is not in arr, we should add the media object to the screen
    componentDidUpdate: function () {
        var self = this;
        // APEP if we update - transition media or get queues media that has been removed
        try {
            this.props.mediaQueue.setTransitionHandler(this.mediaObjectTransition);
            if (self.props.mediaQueue.getDisplayInterval() !== undefined && !self.state.interval) {
                self.startLoadMediaObjectsInterval();
                self.setState({interval: true});
            }
        } catch (e) {
            console.log("RVP - componentDidUpdate - e: ", e);
        }
    },

    generateMediaObjectComponentData: function(mediaObject, moDoneHandler, key) {
        return {
            mediaObject: mediaObject,
            player: this.refs.player,
            //Attach the done handler using react props
            moDoneHandler: moDoneHandler,
            // APEP we may want to assign below [displayDuration, transitionDuration] within mediaObject these within the state.arr push.
            // It's something we need to see if this change of props would cause any of the media objects to update when we might
            // not want them to update.
            displayDuration: this.props.mediaQueue.getDisplayDuration(),
            transitionDuration: this.props.mediaQueue.getTransitionDuration(),
            triggerMediaActiveTheme: this.props.triggerMediaActiveTheme,
            key: key
        };
    },

    render: function () {

        var self = this;

        var queueMediaObjects = self.state.arr.map(function (mediaObject, index) {
            var data = self.generateMediaObjectComponentData(mediaObject, self.moDoneHandler, index);
            return (
                <MediaObject ref={mediaObject.guid} key={mediaObject.guid} data={data}></MediaObject>
            );
        });

        var cuePointMediaObjects = self.props.cuePointMediaObjects.map(function(mediaObject, index){
            var data = self.generateMediaObjectComponentData(mediaObject, self.cueMoDoneHandler, mediaObject.guid);
            return (
                <MediaObject ref={mediaObject.guid} key={mediaObject.guid} data={data}></MediaObject>
            );
        });

        return (
            <div className="player" ref="player">
                {queueMediaObjects}
                {cuePointMediaObjects}
            </div>
        );
    }

});

module.exports = RandomVisualPlayer;
