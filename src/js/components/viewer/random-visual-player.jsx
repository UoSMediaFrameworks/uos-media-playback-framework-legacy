var React = require('react');
var MediaObject = require('../viewer/models/media-object.jsx');
var lodash = require('lodash');
var VideoMediaObject = require('../../utils/media-object/video-media-object');
var ImageMediaObject = require('../../utils/media-object/image-media-object');
var TextMediaObject = require('../../utils/media-object/text-media-object');
var variableThrottle = require('../../utils/variable-throttle');
var hat = require('hat');

var RandomVisualPlayer = React.createClass({
    getInitialState: function () {
        return {
            queue: [],
            arr: [],
            mediaQueue: {},
            interval: false
        };
    },

    loadMediaObject: function (queue) {
        var self = this;
        try {
            lodash.forEach([VideoMediaObject, ImageMediaObject, TextMediaObject], function (moType) {

                var obj = queue.mediaQueue.take([moType]);

                if (obj !== undefined) {

                    obj.guid = obj.guid || hat();
                    self.state.arr.push(obj);

                    //APEP Setting state will trigger a new render, with a new render components will be unmounted/mounted
                    self.setState({mediaQueue: self.props.mediaQueue, arr: self.state.arr});
                }
            });
        } catch (e) {
            console.log("rsvp error", e)
        }

    },

    moDoneHandler: function (mediaObject) {

        //console.log("randomVisualPlayer - moDoneHandler - mediaObject: ", mediaObject.props.data.mediaObject);

        // APEP for any non video type media, we can similarly clear the video media object
        this.clearMediaObject(mediaObject);

    },

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
        console.log("RVS - will mount");
    },
    componentDidMount: function () {
        console.log("RVS - mounted", this.props);
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
                this.moDoneHandler(reactMediaObject);
            }
        } catch (e) {
            console.log("FAILED TO TRANSITION MEDIA OBJECT E: ", e);
        }

    },

    componentDidUpdate: function () {
        //TODO APEP I think we may need to clean up the existing media if we update with a new scene
        // console.log("randomVisualPlayer - componentDidUpdate");
        // APEP if we update - transition media or get queues media that has been removed
        this.props.mediaQueue.setTransitionHandler(this.mediaObjectTransition);
        var self = this;
        if (self.props.mediaQueue.displayInterval != undefined && !self.state.interval) {
            self.loadMediaObject(self.props);
            setInterval(function () {
                self.loadMediaObject(self.props)
            }, self.props.mediaQueue.displayInterval);
            self.setState({interval: true})
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
                displayDuration: self.props.mediaQueue.displayDuration,
                transitionDuration: self.props.mediaQueue.transitionDuration,
                key: index
            };

            return (
                <MediaObject ref={mediaObject.guid} key={mediaObject.guid} data={data}></MediaObject>
            );
        });

        return (
            <div className="player" ref="player">
                {q}
            </div>
        );
    }

});

module.exports = RandomVisualPlayer;
