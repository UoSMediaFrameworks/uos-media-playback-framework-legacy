'use strict';
var React = require('react');
var getVimeoId = require('../../../utils/get-vimeo-id');
var EmbeddedVimeoPlayer = require('../../../utils/embedded-vimeo-player');
var classNames = require('classnames');
var hat = require('hat');

var VideoMediaObject = React.createClass({
    getInitialState: function () {
        return {
            shown: false,
            volume: 0.001,
            looping: false,
            playbackTimeInterval: null,
            player: null,
            play_duration: null,
            playerId: hat()
        };
    },
    getVolume: function (MediaObject) {
        var volume = MediaObject._obj.volume;
        if (isNaN(volume)) {
            volume = 100;
        }
        return volume / 100;
    },
    componentDidMount: function () {
        var self = this;
        var mediaObject = this.props.data.mediaObject;
        var isVimeo = mediaObject._obj.url.indexOf("vimeo.com") !== -1;
        var videoUrl = isVimeo ? getVimeoId(mediaObject._obj.url) : mediaObject._obj.url;
        self.state.looping = !(mediaObject._obj.autoreplay == undefined || mediaObject._obj.autoreplay < 1);
        self.state.volume = self.getVolume(mediaObject);
        self.state.player = new EmbeddedVimeoPlayer(isVimeo, videoUrl);

        // APEP TODO surprised a setState call is not needed

        if (!self.state.player.isVimeo) { //APEP: ##Hack## for buffering media removal at the end
            try {
                //APEP: ##Hack## for buffering media removal at the end
                self.state.player.raw_player.retrieveManifest(self.state.player.player_url, function (manifest, err) {

                    // APEP TODO Not sure how this async function works inside this sync environment - will likely cause state.play_duration nulls where we may want it
                    if (err) {
                        console.log("Video-Media-Object - componentDidMount - retrieveManifest err: ", err);
                        self.state.play_duration = null;
                    } else {
                        self.state.play_duration = manifest.Period.duration;
                    }
                });

            } catch (e) {
                console.log("e component did mount: ", e);
            }
        }

        var element = this.refs[this.props.data.mediaObject._obj._id];
        element.appendChild(this.state.player._element);
        this.play();
    },

    playVideoAndSetVolume: function() {
        if (this.state.player.isVimeo) {
            this.state.player.vimeo_player.setVolume(this.state.volume || 0.00001);
            this.state.player.vimeo_player.play();
            // this.state.player.vimeo_player.setLoop(this.state.looping || false);
        } else {
            this.state.player.raw_player.play();
            this.state.player.raw_player.setVolume(this.state.volume || 0.0);
        }
    },

    setAndGetElementTransitionInOutPeriod: function() {
        var self =  this;
        var element = self.refs[self.props.data.mediaObject._obj._id];
        var transitionSeconds = self.props.data.transitionDuration / 1000;
        element.style.transition = 'opacity ' + (self.props.data.transitionDuration / 1000) + 's ease-in-out';
        return transitionSeconds;
    },

    setVideoTimeoutOnInterval: function() {
        var self = this;
        self.state.timeoutOnIntervalTimeout = setTimeout(function() {
            console.log("Video-Media-Object - setVideoTimeoutOnInterval - video with autoreplay 0 has played for displayDuration");
            self.transition();
        }, self.props.data.displayDuration)
    },

    setVimeoVideoEndedListeners: function(transitionSeconds) {
        var self = this;
        self.state.player.onPlayProgress(function (data) {
            if ((data.duration - data.seconds) < transitionSeconds || data.duration < transitionSeconds) {
                console.log("Video-Media-Object - setVimeoVideoEndedListeners - Transition video player out - vimeo duration checks");
                self.transition();
            }
        });
        self.state.player.vimeo_player.on('ended', function (e) {
            console.log("Video-Media-Object - setVimeoVideoEndedListeners - Transition video player out - ended");
            self.transition();
        });
    },

    setDashVideoEndedListeners: function() {
        var self = this;
        self.state.player._element.addEventListener('ended', function (e) {
            console.log("Video-Media-Object - setDashVideoEndedListeners - Transition video player out - dashjs player event Ended", e);
            self.transition();
        }, false);


        // APEP TODO the state.play_duration is out of sync scope so probably is null here - will need to review
        //APEP: ##Hack## for buffering media removal at the end
        if (self.state.play_duration !== null && self.state.play_duration > 0) {
            if (self.state._playbackTimeInterval) clearTimeout(self.state._playbackTimeInterval);

            self.state._playbackTimeInterval = setTimeout(function () {
                console.log("Video-Media-Object - Buffering play duration failure - transition media object: ", self);
                self.transition();
            }, self.state.play_duration * 1.15 * 1000);
        }
    },

    play: function () {

        var self = this;

        try {
            //APEP Play the video and set the volume for playback
            self.playVideoAndSetVolume();

            var transitionSeconds = self.setAndGetElementTransitionInOutPeriod();

            self.setState({shown: true});

            if (!self.state.looping) {
                self.setVideoTimeoutOnInterval();
            }

            if (self.state.player.isVimeo) {
                self.setVimeoVideoEndedListeners(transitionSeconds);

            } else {
                self.setDashVideoEndedListeners();
            }
        } catch (e) {
            console.log("VideoMediaObject - play - err: ", e);
        }



    },
    transition: function () {

        // console.log("VideoMediaObject - transition - Video transition call made");

        // APEP TODO Non react version used tween to adjust the volume while transitioning out - consider edition here

        var self = this;

        if(self.state.timeoutOnIntervalTimeout) {
            try {
                clearTimeout(self.state.timeoutOnIntervalTimeout);
            } catch (e) {
                console.log("VideoMediaObject - transition - clearTimeout error e: ", e);
            }
        }

        if (self.state._playbackTimeInterval) clearTimeout(self.state._playbackTimeInterval);

        if (self.props.data.mediaObject.type === "video" && self.props.data.mediaObject._obj.autoreplay <= 1) {
            self.setState({shown: false});
        }

        if (self.props.data.mediaObject) {


            console.log("VideoMediaObject - transition - emitting transition for mediaObject and calling done handler");

            // APEP TODO we must reset the player to avoid memory problems - Missing from translation from Vanilla to React
            // self._player.raw_player.reset();
            
            try {
                self.props.data.mediaObject.emit("transition", self.props.data.mediaObject);

                self.props.data.moDoneHandler(self);
            } catch (e) {
                console.log("VideoMediaObject - transition - failed to complete clean up with error: ", e);                
            }
        }
    },

    render: function () {
        var objectClasses = classNames({
            "video-media-object": true,
            "media-object": true,
            "show-media-object": this.state.shown
        });

        return (
            <div key={this.state.playerId} ref={this.props.data.mediaObject._obj._id} className={objectClasses}></div>
        );
    }
});
module.exports = VideoMediaObject;
