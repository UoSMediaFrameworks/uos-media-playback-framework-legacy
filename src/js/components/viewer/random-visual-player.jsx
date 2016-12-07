var React = require('react');
var MediaObject = require('../viewer/models/media-object.jsx');
var lodash = require('lodash');
var VideoMediaObject = require('../../utils/media-object/video-media-object');
var ImageMediaObject = require('../../utils/media-object/image-media-object');
var TextMediaObject = require('../../utils/media-object/text-media-object');
var variableThrottle = require('../../utils/variable-throttle');
var uuid = require('node-uuid');

var RandomVisualPlayer = React.createClass({
    getInitialState: function () {
        return {
            queue: [],
            arr: [],
            looplessMediaObjects: [],
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
                moDoneHandler: self.moDoneHandler,
                displayDuration: self.props.mediaQueue.displayDuration,
                transitionDuration: self.props.mediaQueue.transitionDuration,
                key: index
            };
            return (
                <MediaObject key={mediaObject.guid} data={data}></MediaObject>
            );
        });
        //  console.log(this.state.arr);
        this.setState({mediaQueue: this.props.mediaQueue, queue: q});
    },
    moDoneHandler: function (mediaObject) {
        // console.log("randomVisualPlayer - moDoneHandler - mediaObject: ", mediaObject.props.data.mediaObject);
        if (mediaObject.props.data.mediaObject.type !== "video") {
            this.clearMediaObject(mediaObject);
            return;
        }
        this.vmoDoneHandler(mediaObject)
    },
    vmoDoneHandler: function (videoMediaObject) {
        var self = this;
        console.log("randomVisualPlayer -vmoDoneHandler - mediaObject: ", videoMediaObject);
        if (videoMediaObject.props.data.mediaObject._obj.autoreplay === 0 || videoMediaObject.props.data.mediaObject._obj.autoreplay === 1) {
            videoMediaObject.props.data.mediaObject.emit("transition", videoMediaObject.props.data.mediaObject);
            setTimeout(function () {
                videoMediaObject.props.data.mediaObject.emit("done", videoMediaObject.props.data.mediaObject);
                self.clearMediaObject(videoMediaObject);
            }, videoMediaObject.props.data.transitionDuration)
            self.clearMediaObject(videoMediaObject);
            return;
        }
        if (videoMediaObject.props.data.mediaObject.currentLoop == undefined) {
            videoMediaObject.props.data.mediaObject.currentLoop = 1;
            console.log("current video has autoreplay value of 1>", videoMediaObject.props.data.mediaObject._obj.autoreplay)
            //TODO if not vimeo
            //  videoMediaObject.play();
        } else if (videoMediaObject.props.data.mediaObject.currentLoop < videoMediaObject.props.data.mediaObject._obj.autoreplay) {
            console.log("CurrentLoop: ", videoMediaObject.props.data.mediaObject.currentLoop);
            videoMediaObject.props.data.mediaObject.currentLoop++;


            //TODO if not vimeo
            // videoMediaObject.play();
        } else {
            videoMediaObject.props.data.mediaObject.currentLoop = 0;
            videoMediaObject.props.data.mediaObject.emit("transition", videoMediaObject.props.data.mediaObject);
            setTimeout(function () {
                videoMediaObject.props.data.mediaObject.emit("done", videoMediaObject.props.data.mediaObject);
                self.clearMediaObject(videoMediaObject);
            }, videoMediaObject.props.data.transitionDuration)
            //videoMediaObject.transition(); //causing some issues
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
