'use strict';

const React = require('react');
const Component = React.Component;

var _ = require('lodash');
var classNames = require('classnames');
var ReactAudioPlayer = require('react-audio-player').default;
var ReactPlayer = require('react-player').default;

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

        console.log(`image style`);

        console.log(this.state.style);

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

        state = _.extend(state, InstanceStateToReact.convertInstanceTransitionProperties(this.props.mo));
        state = _.extend(state, InstanceStateToReact.convertInstanceVisualLayer(this.props.mo));
        state = _.extend(state, InstanceStateToReact.convertInstanceVisualPosition(this.props.mo));

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

        state = _.extend(state, InstanceStateToReact.convertInstanceTransitionProperties(this.props.mo));
        state = _.extend(state, InstanceStateToReact.convertInstanceVisualLayer(this.props.mo));
        state = _.extend(state, InstanceStateToReact.convertInstanceVisualPosition(this.props.mo));

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

    // APEP TODO add transition _transitionType for _transitionTime
    // volume tween using transition properties?

    onCanPlay: function() {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
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
                volume={this.getVolume()}
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

    render: function () {
        return (
            <div>
                {_.map(this.state.media, (mo) => {
                    return <MediaObjectInstance key={mo._id} mo={mo} connection={this.state.connection}/>
                })}
            </div>
        )
    }
});

module.exports = GraphViewer;

