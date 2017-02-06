'use strict';
var React = require('react');
var getVimeoId = require('../../../utils/get-vimeo-id');
var EmbeddedVimeoPlayer = require('../../../utils/embedded-vimeo-player');
var SceneActions = require('../../../actions/scene-actions');
var VideoStore = require('../../../stores/video-media-object-store');
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
        var videoInfo = mediaObject._obj.vmob;

        var videoUrl = isVimeo ? getVimeoId(mediaObject._obj.url) : mediaObject._obj.url;
        self.state.looping = !(mediaObject._obj.autoreplay == undefined || mediaObject._obj.autoreplay < 1);
        self.state.volume = self.getVolume(mediaObject);


        //Angel P:
        // TODO if !isVimeo and videoInfo === undefined , just trigger doen events for it to reload in the queue with the video info.
        //TODO: !isVimeo and videoInfo type unsupported  - remove from queue


        if (!isVimeo && videoInfo == undefined) {
            console.log("VideoMediaObject - componentDidMount - does not have video info");
            self.state.player = null;
            self.props.data.moDoneHandler(self);
        } else {
            self.state.player = new EmbeddedVimeoPlayer(isVimeo, videoUrl, videoInfo);
            // APEP TODO surprised a setState call is not needed.
            if (!self.state.player.isVimeo) { //APEP: ##Hack## for buffering media removal at the end
                if (self.state.player.transcoded) {

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
                }
            }
            var element = this.refs[this.props.data.mediaObject._obj._id];
            element.appendChild(this.state.player._element);
            // APEP for non transcoded videos that have fallen back to single html5 player fallback, load the html 5 video
            if (!self.state.player.transcoded && !self.state.player.isVimeo) {
                self.state.player.raw_player.load();
            }

            this.playerConfigurations();
        }

    },

    // Allow component to clear up during removing from DOM
    componentWillUnmount: function () {
        console.log("video Unmounting");

        // APEP TODO investigation to resolving video media object errors during graph viewer
        // APEP TODO I really think each object should be responsible for cleaning up after it self...
        // var self = this;
        //
        // if(self.state.timeoutOnIntervalTimeout) {
        //     try {
        //         clearTimeout(self.state.timeoutOnIntervalTimeout);
        //     } catch (e) {
        //         console.log("VideoMediaObject - transition - clearTimeout error e: ", e);
        //     }
        // }
        //
        // if (self.state._playbackTimeInterval) clearTimeout(self.state._playbackTimeInterval);
        //
        // if (self.props.data.mediaObject){
        //     if (!self.state.player.isVimeo) {
        //
        //         if(self.state.player.raw_player) {
        //             // APEP reset the player to remove GPU memory and memory growth over time
        //             self.state.player.raw_player.reset();
        //         }
        //     }
        // }
        //
        // if(self.state.player) {
        //     self.state.player.remove();
        // }
    },

    dashPlayerSeeked: function (e) {
        console.log("VideoMediaObject - PLAYBACK_SEEKED - e: ", e);
        this.state.player.raw_player.play();
    },
    triggerEventHandler: function (e) {

        var currentTime = 0;

        // APEP try parse each for of getting time
        try {
            if(e.seconds){
                currentTime = e.seconds;
            }
        } catch (e) {
            console.log("e: ", e);
        }

        try {
            if(e.time){
                currentTime =e.time;
            }
        } catch (e) {
            console.log("e: ", e);
        }

        //APEP TODO probably the only one that needs try catch due e.target.currentTime throws errors for target undefined
        try {
            if(e.target.currentTime){
                currentTime = e.target.currentTime;
            }
        } catch (e) {
            console.log("e: ", e);
        }

        var triggers = this.props.data.mediaObject._obj.triggers || [];

        var self = this;
        for (var i = 0; i < triggers.length; i++) {
            try {
                var trigger = triggers[i];
                //We need to turn the time to seconds not miliseconds
                if (currentTime >= trigger.timeSinceStartOfVideo && currentTime < trigger.timeSinceStartOfVideo + 1) {
                    if (trigger.locked == undefined) {
                        trigger.locked = false;
                    }
                    if (!trigger.locked) {
                        self.props.data.triggerMediaActiveTheme(trigger.themes);
                        trigger.locked = true;
                    }
                    triggers[i] = trigger;
                }
            } catch (e) {
                console.log("err", e)
            }
        }
    },
    attachTriggers: function () {
        var self = this;
        var triggers = this.props.data.mediaObject._obj.triggers || [];
        for (var i = 0; i < triggers.length; i++) {
            if(triggers[i].locked){
                triggers[i].locked = false;
            }
        }
        if (self.state.player.isVimeo) {
            self.state.player.vimeo_player.on('timeupdate', self.triggerEventHandler);
        } else {
            if (self.state.player.transcoded) {
                self.state.player.raw_player.on("playbackTimeUpdated", self.triggerEventHandler)
            }else{
                self.state.player._element.ontimeupdate=self.triggerEventHandler;
            }
        }
    },
    playVideoAndSetVolume: function () {
        var self = this;
        if (self.state.player.isVimeo) {
            self.state.player.vimeo_player.setVolume(self.state.volume || 0.00001);
            // TODO APEP give vimeo a small time window between playout, we should really use ready listener for this
            setTimeout(function () {
                self.state.player.vimeo_player.play();
            }, 150);
        } else {
            try {
                if (self.state.player.transcoded) {
                    self.state.player.raw_player.setVolume(self.state.volume || 0.0);
                } else {
                    self.state.player.raw_player.load();
                    self.state.player.raw_player.volume = self.state.volume || 0.0;
                }
            } catch (e) {
                console.log("VideoMediaObject - playVideoAndSetVolume - error handling volume /w load if not dash - e: ", e);
            } finally {
                console.log("VideoMediaObject - playVideoAndSetVolume - seek to begin and start");

                //APEP Add a seeked event listener, this allows use to start the player when it's ready
                //APEP this handles both cases for initial playback and replaying, when replaying the dashjs player
                //needs a little time before we can call play again, seeked provides us a handle for when it's ready
                self.state.player._element.addEventListener('seeked', this.dashPlayerSeeked);
                if (self.state.player.raw_player.transcoded) {
                    self.state.player.raw_player.seek(0);
                } else {
                    //ANGEL P: added a seek and play for the non transcoded video, it does not autoplay and current time is the form
                    //of seek functionality needed
                    self.state.player.raw_player.currentTime = 0;
                    self.state.player.raw_player.play();

                }

            }
        }
    },

    setAndGetElementTransitionInOutPeriod: function () {
        var self = this;
        var element = self.refs[self.props.data.mediaObject._obj._id];
        var transitionSeconds = self.props.data.transitionDuration / 1000;
        element.style.transition = 'opacity ' + (self.props.data.transitionDuration / 1000) + 's ease-in-out';
        return transitionSeconds;
    },

    setVideoTimeoutOnInterval: function () {
        var self = this;
        self.state.timeoutOnIntervalTimeout = setTimeout(function () {
            console.log("Video-Media-Object - setVideoTimeoutOnInterval - video with autoreplay 0 has played for displayDuration");
            self.transition();
        }, self.props.data.displayDuration)
    },

    setVimeoVideoEndedListeners: function (transitionSeconds) {
        var self = this;
        self.state.player.vimeo_player.on('ended', function (e) {
            console.log("Video-Media-Object - setVimeoVideoEndedListeners - Transition video player out - ended");
            self.transition();
        });
    },

    setDashVideoEndedListeners: function () {
        var self = this;
        self.state.player._element.addEventListener('ended', function (e) {
            console.log("Video-Media-Object - setDashVideoEndedListeners - Transition video player out - 'ended' dashjs player event Ended", e);
            self.transition();
        }, false);

        // APEP TODO the state.play_duration is out of sync scope so probably is null here - will need to review
        // APEP: ##Hack## for buffering media removal at the end

        if (self.state.play_duration !== null && self.state.play_duration > 0) {
            if (self.state._playbackTimeInterval) clearTimeout(self.state._playbackTimeInterval);

            self.state._playbackTimeInterval = setTimeout(function () {
                console.log("Video-Media-Object - Buffering play duration failure - transition media object: ", self);
                self.transition();
            }, self.state.play_duration * 1.15 * 1000);
        }
    },
    playerConfigurations: function () {
        var self = this;
        try {
            //APEP Play the video and set the volume for playback
            self.playVideoAndSetVolume();
            self.attachTriggers();
            var transitionSeconds = self.setAndGetElementTransitionInOutPeriod();
            self.setState({shown: true});

            if (!self.state.looping) {
                self.setVideoTimeoutOnInterval();
            }

            if (self.state.player.isVimeo) {
                self.setVimeoVideoEndedListeners(transitionSeconds);

            } else {

                try {
                    self.setDashVideoEndedListeners();
                } catch (e) {
                    console.log("MediaVideoObject - play - Raw Player Error setting listeners", e)
                }

            }
        } catch (e) {
            console.log("VideoMediaObject - play - err: ", e);
        }
    },
    play: function () {
        this.playVideoAndSetVolume();
        this.attachTriggers();
    },
    resetGPUforTranscoded: function () {
        var self = this;
        //console.log("VideoMediaObject - transition - emitting transition for mediaObject and calling done handler");
        try {
            if (!self.state.player.isVimeo) {
                // APEP reset the player to remove GPU memory and memory growth over time
                if (self.state.player.transcoded) {

                    // APEP remove the event listener in case it tries to replay
                    self.state.player.raw_player.reset();
                    self.state.player._element.removeEventListener('seeked', self.dashPlayerSeeked);
                    self.state.player.raw_player.off('playbackTimeUpdated',  self.triggerEventHandler);
                }
            }
            // APEP TODO this needs to be after the transition out animation and before the start of it again
        } catch (e) {
            console.log("VideoMediaObject - transition - failed to complete clean up with error: ", e);
        }

    },

    videoDone: function () {
        try {
            this.setState({shown: false});
            this.props.data.moDoneHandler(this);
        } finally {
            this.resetGPUforTranscoded();
        }
    },

    loopingHandler: function () {
        console.log("loopingHandler");

        var vmo = this.props.data.mediaObject;

        if (vmo._obj) {
            if (vmo._obj.autoreplay === 0 || vmo._obj.autoreplay === 1) {
                this.videoDone();
                return;
            }

            if (vmo.currentLoop == undefined) {
                vmo.currentLoop = 1;
                this.play();
            } else if (vmo.currentLoop < vmo._obj.autoreplay) {
                console.log("current loop", vmo.currentLoop);
                vmo.currentLoop++;
                this.play();
            } else {
                console.log("remove looping video");
                vmo.currentLoop = 0;
                this.videoDone();
            }
        }

    },

    //APEP ignoreLooping is for queue to purge media objects - this currently only happens when the scene is changed in SceneListener
    // Graph Viewer brought through this change
    transition: function (ignoreLooping) {

        // console.log("VideoMediaObject - transition - Video transition call made");

        // APEP TODO Non react version used tween to adjust the volume while transitioning out - consider edition here

        var self = this;

        if (self.state.timeoutOnIntervalTimeout) {
            try {
                clearTimeout(self.state.timeoutOnIntervalTimeout);
            } catch (e) {
                console.log("VideoMediaObject - transition - clearTimeout error e: ", e);
            }
        }

        if (self.state._playbackTimeInterval) clearTimeout(self.state._playbackTimeInterval);

        if (ignoreLooping) {
            // APEP forcefully ignore logging to remove media object
            console.log("Forcefully removing looping video");
            this.videoDone();
        } else {
            self.loopingHandler();
        }

    },

    render: function () {
        var objectClasses = classNames({
            "video-media-object": true,
            "media-object": true,
            "show-media-object": this.state.shown
        });

        return (
            <div key={this.state.playerId} ref={this.props.data.mediaObject._obj._id} className={objectClasses}
                 onClick={this.props.clickHandler}></div>
        );
    }
});
module.exports = VideoMediaObject;
