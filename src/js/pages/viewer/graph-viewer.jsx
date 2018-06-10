'use strict';

const React = require('react');
const Component = React.Component;

var _ = require('lodash');
var classNames = require('classnames');
var ReactAudioPlayer = require('react-audio-player').default;
var ReactPlayer = require('react-player').default;
var ReactAnimationFrame = require('react-animation-frame');
var TWEEN = require('@tweenjs/tween.js');

var MediaEngineStore = require('../../stores/media-engine-store');
var InternalEventConstants = require('../../private-dependencies/internal-event-constants');
var MediaEngineSendActions = require('../../actions/media-engine/send-actions');


// APEP classnames documentation
// media-object position: abs and opacity 0 with show-media-object bring opacity back to 1

class InstanceStateToReact {
    static convertInstanceTransitionProperties(mo) {
        // APEP MF convention (using classnames) defines opacity to be 0 until show-media-object is applied
        // Therefore the transition for visual media objects is implemented by producing a CSS transition
        return {
            style: {
                "transition": `opacity ${mo._transitionTime}s ${mo._transitionType}`,
            }
        }
    }

    static convertInstanceVisualLayer(mo) {
        return {
            style: {
                "zIndex": mo.visualLayer + 10
            }
        }
    }

    static _convertNormalisedPositionValueToPercentage(val) {
        return `${val * 100}%`
    }

    static convertInstanceVisualPosition(mo) {
        let width = InstanceStateToReact._convertNormalisedPositionValueToPercentage(mo.visualPosition.width);
        let height = InstanceStateToReact._convertNormalisedPositionValueToPercentage(mo.visualPosition.height);

        return {
            style: {
                "left": InstanceStateToReact._convertNormalisedPositionValueToPercentage(mo.visualPosition.x),
                "top": InstanceStateToReact._convertNormalisedPositionValueToPercentage(mo.visualPosition.y),
                "width": width,
                "maxWidth": width,
                "height": height,
                "maxHeight": height,
            }
        }
    }
}

var ImageMediaObjectInstance = React.createClass({

    getInitialState: function () {
        let state = {
            style: {
            }
        };

        state.style = _.merge(state.style, InstanceStateToReact.convertInstanceTransitionProperties(this.props.mo).style);
        state.style = _.merge(state.style, InstanceStateToReact.convertInstanceVisualLayer(this.props.mo).style);
        state.style = _.merge(state.style, InstanceStateToReact.convertInstanceVisualPosition(this.props.mo).style);

        return state
    },

    // APEP 160518 A valid on load for a image media object
    domImageLoaded: function () {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
    },

    render: function () {

        const IMAGE_CLASSES = classNames({
            "image-media-object": true,
            "media-object": true,
            "show-media-object": this.props.mo.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING
        });

        return (
            <img
                src={this.props.mo.url}
                onLoad={this.domImageLoaded}
                className={IMAGE_CLASSES}
                style={this.state.style}/>
        )
    }
});

var DashVideoMediaObjectInstance = React.createClass({

    getInitialState: function () {

        let state = {
            style: {}
        };

        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceTransitionProperties(this.props.mo).style);
        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceVisualLayer(this.props.mo).style);
        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceVisualPosition(this.props.mo).style);

        return state;
    },

    // volume tween using transition properties?

    // APEP 160518 valid on load for a dash video media object
    onReady: function () {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
    },

    render: function () {

        let VIDEO_CLASSES = classNames({
            "video-media-object": true,
            "media-object": true,
            "show-media-object": this.props.mo.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING
        });

        return (
            <ReactPlayer
                url={this.props.mo._content}
                config={{
                    file: {forceDASH: true}
                }}
                className={VIDEO_CLASSES}
                style={this.state.style}
                onReady={this.onReady}
                playing
            />
        )
    }
});

var VideoMediaObjectInstance = React.createClass({
    render: function () {
        return (
            <DashVideoMediaObjectInstance mo={this.props.mo} connection={this.props.connection}/>
        )
    }
});

var DebugMediaObjectInstance = React.createClass({

    getInitialState: function () {
        let state = {
            style: {}
        };

        state = _.extend(state, InstanceStateToReact.convertInstanceTransitionProperties(this.props.mo));
        state = _.extend(state, InstanceStateToReact.convertInstanceVisualLayer(this.props.mo));

        return state;
    },

    // APEP 160518 A valid on load for a debug media object
    componentDidMount: function() {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
    },

    render: function () {
        return (<p style={this.state.style}>{this.props.mo._id} : {this.props.mo.type}</p>)
    }
});

var TextMediaObjectInstance = React.createClass({

    getInitialState: function () {

        let state = {
            style: {}
        };

        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceTransitionProperties(this.props.mo).style);
        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceVisualLayer(this.props.mo).style);
        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceVisualPosition(this.props.mo).style);

        return state;
    },

    // APEP 160518 A valid on load for a text media object
    componentDidMount: function() {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
    },

    render: function () {

        let TEXT_CLASSES = classNames({
            "text-media-object": true,
            "media-object": true,
            "show-media-object": this.props.mo.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING
        });

        return (
            <p className={TEXT_CLASSES} style={this.state.style}>
                {this.props.mo._content}
            </p>
        )
    }
});

var AudioMediaObjectInstance = React.createClass({

    getInitialState: function () {
        return {
            volume: 0,

            transitionIn: null,
            transitionOut: null
        };
    },

    onCanPlay: function() {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
    },

    componentDidUpdate: function(prevProps, prevState, snapshot) {

        let isTransitionIn = prevProps.mo.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.LOADED &&
            this.props.mo.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING;

        if (isTransitionIn) {
            console.log(`Starting tween volume in - tween for ${this.props.mo._transitionTime}`);

            let self = this;
            let tween = new TWEEN.Tween({vol: 0})
                .to({vol: this.getVolume()}, this.props.mo._transitionTime * 1000)
                .onUpdate((obj) => {
                    self.setState({volume: obj.vol});
                });
            self.setState({transitionIn: tween});
            tween.start();

            return;
        }

        let isTransitionOut = prevProps.mo.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING &&
            this.props.mo.state.compositeState() === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.TRANSITION;

        if (isTransitionOut) {
            console.log(`Starting tween volume OUT - tween for ${this.props.mo._transitionTime}`);

            this._stopTransitionIn();

            let self = this;

            let tween = new TWEEN.Tween({vol: this.getVolume()})
                .to({vol: 0}, this.props.mo._transitionTime * 1000)
                .onUpdate((obj) => {
                    self.setState({volume: obj.vol});
                });
            self.setState({transitionOut: tween});
            tween.start();
        }
    },

    _stopTransitionIn: function() {
        if(this.state.transitionIn) {
            console.log("componentWillUnmount - transitionIn");
            this.state.transitionIn.stop();
            TWEEN.remove(this.state.transitionIn);
        }
    },

    _stopTransitionOut: function() {
        if(this.state.transitionOut) {
            console.log("componentWillUnmount - transitionOut");
            this.state.transitionOut.stop();
            TWEEN.remove(this.state.transitionOut);
        }
    },

    componentWillUnmount: function() {
        this._stopTransitionIn();

        this._stopTransitionOut();
    },

    getVolume: function() {
        // APEP protect against missing _volume property
        return (this.props.mo._volume || 100) / 100
    },

    render: function () {
        return (
            <ReactAudioPlayer
                src={this.props.mo._content}
                onCanPlay={this.onCanPlay}
                volume={this.state.volume}
                autoPlay
            />
        )
    }
});

var MediaObjectInstance = React.createClass({
    render: function () {

        let el = null;

        if (this.props.mo.type === "image") {
            el = <ImageMediaObjectInstance key={`instance-${this.props.mo._id}`} mo={this.props.mo} connection={this.props.connection}/>
        } else if (this.props.mo.type === "video") {
            el = <VideoMediaObjectInstance key={`instance-${this.props.mo._id}`} mo={this.props.mo} connection={this.props.connection}/>
        } else if (this.props.mo.type === "text") {
            el = <TextMediaObjectInstance key={`instance-${this.props.mo._id}`} mo={this.props.mo} connection={this.props.connection}/>
        } else if (this.props.mo.type === "audio") {
            el = <AudioMediaObjectInstance key={`instance-${this.props.mo._id}`} mo={this.props.mo} connection={this.props.connection}/>
        } else {
            el = <DebugMediaObjectInstance key={`instance-${this.props.mo._id}`} mo={this.props.mo} connection={this.props.connection}/>
        }

        return el
    }
});

var GraphViewer = React.createClass({

    getInitialState: function () {
        return this.getStateFromStores();
    },

    getStateFromStores: function () {
        return {
            media: MediaEngineStore.getMedia(),
            connection: MediaEngineStore.getConnection()
        }
    },

    _onChange: function () {
        console.log("GraphView[MEDIA ENGINE RENDERER] - got an update event from a Store")

        console.log(this.getStateFromStores());

        this.setState(this.getStateFromStores());
    },

    componentDidMount: function () {
        MediaEngineStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        MediaEngineStore.removeChangeListener(this._onChange);
    },

    onAnimationFrame(time) {
        // Using the ReactAnimationFrame wrapper - we can hook into the browsers animation timer for TWEEN js
        // This is required for any tween to work correctly.
        // By using the param time, we can limit the performance impact, default of 50ms chosen.
        // For higher performance we can throttle this update further
        TWEEN.update(time);
    },

    reloadController: function () {
        console.log("USE API TO RELOAD CONTROLLER");
        MediaEngineSendActions.restartController();
    },

    render: function () {

        let restartController = <button
            className='btn btn-dark'
            onClick={this.reloadController}
            style={{position: 'absolute', opacity: 0.2}}>reload controller data</button>;

        return (
            <div>
                {restartController}

                {_.map(this.state.media, (mo) => {
                    return <MediaObjectInstance key={mo._id} mo={mo} connection={this.state.connection}/>
                })}
            </div>
        )
    }
});

module.exports = ReactAnimationFrame(GraphViewer, 50);

