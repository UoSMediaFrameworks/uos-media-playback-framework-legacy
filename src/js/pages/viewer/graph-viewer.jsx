'use strict';

const React = require('react');

var _ = require('lodash');
var classNames = require('classnames');
var ReactAudioPlayer = require('react-audio-player').default;
var TWEEN = require('@tweenjs/tween.js');

var MediaEngineStore = require('../../stores/media-engine-store');
var InternalEventConstants = require('../../private-dependencies/internal-event-constants');
var MediaEngineSendActions = require('../../actions/media-engine/send-actions');

const MINIMUM_AUDIO_VOLUME = 0.0001;
const AUDIO_TRANSITION_IN_DURATION = 0.5;

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
            "show-media-object": this.props.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING
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

var ShakaPlayerDashVideoMediaObjectInstance = React.createClass({

    getInitialState: function () {

        let state = {
            style: {}
        };

        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceTransitionProperties(this.props.mo).style);
        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceVisualLayer(this.props.mo).style);
        state.style = _.extend(state.style, InstanceStateToReact.convertInstanceVisualPosition(this.props.mo).style);

        this.dash = null;

        return state;
    },

    // APEP 160518 valid on load for a dash video media object
    onReady: function () {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
    },

    onEnded: function () {
        MediaEngineSendActions.mediaObjectInstanceFileEnded(this.props.connection, this.props.mo);
    },

    componentDidMount: function() {

        this.dash = new shaka.Player(this.refs.player);

        this.dash.load(this.props.mo._content)
            .then(() => {
                console.log("shaka player loaded");
                this.onReady();
            });

        this.dash.addEventListener('error', this.onEnded);
        // this.dash.addEventListener('playing', onPlaying);
        // this.dash.addEventListener('pause', onPause);
        this.dash.addEventListener('ended', this.onEnded);
        this.dash.volume = this.props.mo._authoredVolume / 100;
    },

    componentWillUnmount: function() {
        if (this.dash) {
            this.dash.removeEventListener('ended', this.onEnded);
            this.dash.removeEventListener('error', this.onEnded);
            this.dash.unload();
            this.dash.destroy();
        }
    },

    onInitialised: function (e) {
        try {
        } finally {
        }
    },

    render: function () {

        let VIDEO_CLASSES = classNames({
            "video-media-object": true,
            "media-object": true,
            "show-media-object": this.props.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING
        });

        return (
            <video
                ref="player"
                className={VIDEO_CLASSES}
                style={this.state.style}
                preload='none'
                autoPlay={true}
                controls={false}
                width={this.state.style.width}
                height={this.state.style.height}>
            </video>
        );
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

        this.dash = null;

        return state;
    },

    // volume tween using transition properties?

    // APEP 160518 valid on load for a dash video media object
    onReady: function () {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
    },

    onEnded: function () {
        MediaEngineSendActions.mediaObjectInstanceFileEnded(this.props.connection, this.props.mo);
    },

    componentDidMount: function() {
        this.dash = dashjs.MediaPlayer().create();
        this.dash.getDebug().setLogToBrowserConsole(false);
        this.dash.initialize(this.refs.player, this.props.mo._content, true);
        this.dash.setVolume(this.props.mo._authoredVolume / 100);

        // this.dash.on(dashjs.MediaPlayer.events['STREAM_INITIALIZED'], this.onInitialised);
        this.refs.player.addEventListener('canplay', this.onReady);
        this.refs.player.addEventListener('ended', this.onEnded);
    },

    componentWillUnmount: function() {
        if (this.dash) {
            // this.dash.off(dashjs.MediaPlayer.events['STREAM_INITIALIZED'], this.onInitialised);
            this.refs.player.removeEventListener('canplay', this.onReady);
            this.refs.player.removeEventListener('ended', this.onEnded);
            this.dash.reset();
            this.dash = null;
        }
    },

    // APEP 190718 hook into the dashjs specific property
    onInitialised: function (e) {
        try {
            // APEP tune the dash settings to support fast pace changing videos rather than reliable live streaming
            this.dash.setBufferToKeep(0);
            // APEP later versions of dash have this
            // dash.setBufferAheadToKeep(8);
            // dash.setBufferPruningInterval(5);
        } finally {
            console.log("DASH JS methods missing for optimisation");
        }
    },

    render: function () {

        let VIDEO_CLASSES = classNames({
            "video-media-object": true,
            "media-object": true,
            "show-media-object": this.props.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING
        });

        return (
            <video
                ref="player"
                className={VIDEO_CLASSES}
                style={this.state.style}
                preload='none'
                autoPlay={true}
                controls={false}
                width={this.state.style.width}
                height={this.state.style.height}>
            </video>
        );
    }
});

var VideoMediaObjectInstance = React.createClass({
    render: function () {
        return (
            <ShakaPlayerDashVideoMediaObjectInstance mo={this.props.mo} connection={this.props.connection}/>
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
            "show-media-object": this.props.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING
        });

        return (
            <p className={TEXT_CLASSES} style={this.state.style}>
                {this.props.mo._content}
            </p>
        )
    }
});

var AudioContextMediaObjectInstance = React.createClass({
    getInitialState: function () {
        return {
            volume: MINIMUM_AUDIO_VOLUME,

            transitionIn: null,
            transitionOut: null
        };
    },

    onCanPlay: function() {
        MediaEngineSendActions.mediaObjectInstanceReady(this.props.connection, this.props.mo);
    },

    componentDidUpdate: function(prevProps, prevState, snapshot) {

        let isTransitionIn = prevProps.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.LOADED &&
            this.props.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING;

        if (isTransitionIn) {
            // console.log(`Starting tween volume in - tween for ${this.props.mo._transitionTime} to ${this.getVolume()}`);

            // this.transitionInTime = this.props.audioContext.currentTime + AUDIO_TRANSITION_IN_DURATION;
            this.transitionInTime = this.props.audioContext.currentTime + this.props.mo._transitionTime;

            this.gainNode.gain.linearRampToValueAtTime(this.getVolume(), this.transitionInTime);
        }

        let isTransitionOut = prevProps.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING &&
            this.props.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.TRANSITION;

        if (isTransitionOut) {
            // console.log(`Starting tween volume OUT - tween for ${this.props.mo._transitionTime}`);

            this.transitionOutTime = this.props.audioContext.currentTime + this.props.mo._transitionTime;

            this.gainNode.gain.linearRampToValueAtTime(MINIMUM_AUDIO_VOLUME, this.transitionOutTime);
        }

        let isVolumeUpdate = prevProps.mo._volume !== this.props.mo._volume;

        // APEP if we've had a volume property change
        if (isVolumeUpdate) {
            // APEP stop any automatic system volume tweens - the performer should take over

            // APEP TODO consider making inclusive of the end time of the linear RAMP ?
            let currentTime = this.props.audioContext.currentTime;
            if (currentTime < this.transitionInTime ) {
                // APEP this update has come in before the transition in has completed
                this._stopScehduledRampValues();

                // then reset transitionInTime to 0, to say hey we've cancelled it once
                this.transitionInTime = 0;
            }

            if (currentTime < this.transitionOutTime) {
                // APEP this update has come before the transition out has complete

                this._stopScehduledRampValues();

                // APEP we've now cancelled the transition, so we can not do this again
                this.transitionOutTime = 0;
            }

            let nextVolumeUpdateTime = this.props.audioContext.currentTime + 0.05;
            this.gainNode.gain.linearRampToValueAtTime(this._getPropVolumeProtected(), nextVolumeUpdateTime);
        }

    },

    // APEP handle some API audio volume concerns
    _getPropVolumeProtected: function () {
        let propVol = this.props.mo._volume / 100;

        if (propVol <= 0) {
            return MINIMUM_AUDIO_VOLUME;
        }

        if (propVol > 1) {
            return 1;
        }

        return propVol;
    },

    _stopScehduledRampValues: function() {
        if (this.gainNode) {
            this.gainNode.gain.cancelScheduledValues(this.props.audioContext.currentTime);
        }
    },

    componentWillUnmount: function() {
        this._stopScehduledRampValues();

        if (this.gainNode)
            this.gainNode.disconnect();
        if (this.sourceNode)
            this.sourceNode.disconnect();
    },

    componentDidMount: function () {

        let source = this.props.audioContext.createMediaElementSource(this.sound.audioEl);

        let gainNode = this.props.audioContext.createGain();

        // connect the AudioBufferSourceNode to the gainNode
        // and the gainNode to the destination, for vol change
        source.connect(gainNode);

        gainNode.connect(this.props.audioContext.destination);

        // APEP force the sound to start at 0 volume from 0t
        gainNode.gain.setValueAtTime(MINIMUM_AUDIO_VOLUME, 0);

        // APEP initial some variables that are not related to the rendering process, ie never be apart of the react component update cycle
        this.transitionInTime = 0;
        this.transitionOutTime = 0;

        // this.lastManualVolumeChangeTime = 0;

        this.sourceNode = source;
        this.gainNode = gainNode;
    },

    getVolume: function() {
        let volume = this.props.mo._volume;

        if (_.isNumber(volume)) {
            if (volume <= 0) {
                return MINIMUM_AUDIO_VOLUME;
            }
        }

        volume = volume / 100;

        return volume;
    },

    render: function () {
        // console.log(`audio render ${this.state.volume}`);
        // APEP autoPlay improves latency (suspected cold cache during testing)
        return (
            <ReactAudioPlayer
                src={this.props.mo._content}
                onCanPlay={this.onCanPlay}
                ref={(element) => { this.sound = element; }}
                preload="none"
                autoPlay
            />
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

        let self = this;

        let isTransitionIn = prevProps.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.LOADED &&
            this.props.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING;

        if (isTransitionIn) {
            // console.log(`Starting tween volume in - tween for ${this.props.mo._transitionTime} to ${this.getVolume()}`);

            let tween = new TWEEN.Tween({vol: 0})
                .to({vol: this.getVolume()}, this.props.mo._transitionTime * 1000)
                .onUpdate((obj) => {
                    self.setState({volume: obj.vol});
                });
            self.setState({transitionIn: tween});
            tween.start();

            return;
        }

        let isTransitionOut = prevProps.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING &&
            this.props.mo.state.state === InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.TRANSITION;

        if (isTransitionOut) {
            // console.log(`Starting tween volume OUT - tween for ${this.props.mo._transitionTime}`);

            this._stopTransitionIn();

            let tween = new TWEEN.Tween({vol: this.getStateVolume()})
                .to({vol: 0}, this.props.mo._transitionTime * 1000)
                .onUpdate((obj) => {
                    self.setState({volume: obj.vol});
                });
            self.setState({transitionOut: tween});
            tween.start();
        }

        let isVolumeUpdate = prevProps.mo._volume !== this.props.mo._volume;

        // APEP if we've had a volume property change
        if (isVolumeUpdate) {
            // APEP stop any automatic system volume tweens - the performer should take over
            // APEP 220618 While the react component state might not clear up this.state.transitionIn - use a try catch as we do not want to introduce any thrown errors
            try {
                this._stopTransitionIn();
            } catch (e) {
                console.log("componentDidUpdate - failed to stopTransitionIn - either a true error or the tween has been stopped and removed already");
                console.log(e);
            }

            try {
                this._stopTransitionOut();
            } catch (e) {
                console.log("componentDidUpdate - failed to _stopTransitionOut - either a true error or the tween has been stopped and removed already");
                console.log(e);
            }

            self.setState({volume: this.props.mo._volume / 100});
        }

    },

    _stopTransitionIn: function() {
        if(this.state.transitionIn) {
            // console.log("_stopTransitionIn - transitionIn");
            this.state.transitionIn.stop();
            TWEEN.remove(this.state.transitionIn);
        }
    },

    _stopTransitionOut: function() {
        if(this.state.transitionOut) {
            // console.log("_stopTransitionOut - transitionOut");
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

        // console.log(`getVolume ${this.props.mo._volume}`);

        let volume = this.props.mo._volume;

        volume = volume / 100;

        // console.log(`getVolume ${volume}`);

        return volume;
    },

    getStateVolume: function() {
        // APEP as this.state.volume is a number, when the volume is 0, it is being interpreted as false.
        let volumeForTweenOut = this.state.volume; // || this.getVolume();

        // console.log(`getStateVolume - volumeForTweenOut - ${volumeForTweenOut}`);

        return volumeForTweenOut;
    },

    render: function () {
        // console.log(`audio render ${this.state.volume}`);
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
            el = <AudioContextMediaObjectInstance key={`instance-${this.props.mo._id}`} mo={this.props.mo} connection={this.props.connection} audioContext={this.props.audioContext}/>
        } else {
            el = <DebugMediaObjectInstance key={`instance-${this.props.mo._id}`} mo={this.props.mo} connection={this.props.connection}/>
        }

        return el
    }
});

var GraphViewer = React.createClass({

    getInitialState: function () {

        let AudioContext = window.AudioContext || window.webkitAudioContext;

        let audioContext = {
            audioContext: new AudioContext({
                latencyHint: 'interactive',
                sampleRate: 44100
            })
        };

        return _.merge(audioContext, this.getStateFromStores());
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

        let types = _.groupBy(this.state.media, (mo) => {
            return mo.type
        });

        let typeInfo = _.map(Object.keys(types), (type) => {
            return <p style={{backgroundColor: "black", color: "white"}}>
                {type}
                -
                {types[type].length}
            </p>
        });

        // APEP should wrap into a menu with options
        let typeDebugComponent = <div style={{position: 'absolute', top: 0, right: 0, zIndex: 10000000}}>
            {typeInfo}
        </div>;

        return (
            <div>
                {restartController}
                {_.map(this.state.media, (mo) => {
                    return <MediaObjectInstance key={mo._id} mo={mo} connection={this.state.connection} audioContext={this.state.audioContext}/>
                })}
            </div>
        )
    }
});

module.exports = GraphViewer; //ReactAnimationFrame(, 100);

