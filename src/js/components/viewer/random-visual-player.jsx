var React = require('react');
var MediaObject = require('../viewer/models/media-object.jsx');
var lodash = require('lodash');
var VideoMediaObject = require('../../utils/media-object/video-media-object');
var ImageMediaObject = require('../../utils/media-object/image-media-object');
var TextMediaObject = require('../../utils/media-object/text-media-object');
var variableThrottle = require('../../utils/variable-throttle');
var uuid = require('node-uuid');
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

        lodash.forEach([VideoMediaObject, ImageMediaObject, TextMediaObject], function (moType) {

            var obj = queue.mediaQueue.take([moType]);
            if (obj != undefined) {
                obj.guid = uuid();
                self.state.arr.push(obj);
            }
        });

        var q = this.state.arr.map(function (mediaObject, index) {

            var data = {
                mediaObject: mediaObject,
                player: self.refs.player,
                //Attach the done handler using react props
                moDoneHandler: self.moDoneHandler,
                displayDuration: self.props.mediaQueue.displayDuration,
                transitionDuration: self.props.mediaQueue.transitionDuration,
                mediaObjectUniqueKey: hat(),
                key: index
            };
            var mO =  (
                <MediaObject key={mediaObject.guid} data={data}></MediaObject>
            );

            return mO;
        });

        this.setState({mediaQueue: this.props.mediaQueue, queue: q});
    },

    moDoneHandler: function (mediaObject) {

        console.log("randomVisualPlayer - moDoneHandler - mediaObject: ", mediaObject.props.data.mediaObject);

        // APEP for any non video type media, we can similarly clear the video media object
        if (mediaObject.props.data.mediaObject.type !== "video") {
            this.clearMediaObject(mediaObject);
            return;
        }

        // APEP video done handler must be handled separately for autoreplay feature
        this.vmoDoneHandler(mediaObject)
    },

    vmoClearActiveFromQueue: function(videoMediaObject) {
        // APEP required for vanilla JS objects queue to be cleared of this active vmo ( need to review this )
        videoMediaObject.props.data.mediaObject.emit("done", videoMediaObject.props.data.mediaObject);
    },

    vmoAtEndOfLooping: function(videoMediaObject, vmo) {

        this.clearMediaObject(videoMediaObject);
        this.vmoClearActiveFromQueue(videoMediaObject);
    },

    vmoWithAutoReplayZeroOrOne: function (videoMediaObject, vmo) {

        this.clearMediaObject(videoMediaObject);
        this.vmoClearActiveFromQueue(videoMediaObject);
    },

    vmoDoneHandler: function (videoMediaObject) {
        var self = this;

        var vmo = videoMediaObject.props.data.mediaObject;

        console.log("randomVisualPlayer - vmoDoneHandler - vmo: ", vmo);

        if (vmo._obj.autoreplay === 0 || vmo._obj.autoreplay === 1) {
            self.vmoWithAutoReplayZeroOrOne(videoMediaObject, vmo);
            return;
        }
        if (vmo.currentLoop == undefined) {
            videoMediaObject.props.data.mediaObject.currentLoop = 1;
            //TODO if not vimeo
             videoMediaObject.play();
        } else if (vmo.currentLoop < vmo._obj.autoreplay) {
            videoMediaObject.props.data.mediaObject.currentLoop++;
            //TODO if not vimeo
             videoMediaObject.play();
        } else {
            videoMediaObject.props.data.mediaObject.currentLoop = 0;
            self.vmoAtEndOfLooping(videoMediaObject, vmo);
        }
    },
    clearMediaObject: function (mediaObject) {
        var arr = this.state.arr;
        lodash.remove(arr, function (currentObject) {
            return currentObject.guid == mediaObject.props.data.mediaObject.guid;
        });
        this.setState({arr: arr})
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
    componentDidUpdate: function () {
        //TODO APEP I think we may need to clean up the existing media if we update with a new scene
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
        return (
            <div className="player" ref="player">
                {this.state.queue}
            </div>
        );
    }

});

module.exports = RandomVisualPlayer;
