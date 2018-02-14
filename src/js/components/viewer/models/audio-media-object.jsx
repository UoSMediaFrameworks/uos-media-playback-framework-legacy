var React = require('react');
var Audio5 = require('audio5');
var soundCloud = require('../../../utils/sound-cloud');
var TWEEN = require('tween.js');
var AudioUtils = require('../../../utils/audio-utils');

var AudioMediaObject = React.createClass({

    typeName: "audio",

    getInitialState: function () {
        return {
            playing: true,
            autoreplay: 0,
            currentLoop: 0,
            player: null,
            playingAudioTween: null
        };
    },

    componentDidMount: function() {
        // APEP set the autoreply value based off the mediaObject, with an overriding default of 1
        if(this.props.data && this.props.data.mediaObject && this.props.data.mediaObject._obj) {
            var autoreplay = this.props.data.mediaObject._obj.hasOwnProperty("autoreplay") ? this.props.data.mediaObject._obj.autoreplay : 1;
            this.setState({"autoreplay": autoreplay})
        }

        this.play();
    },

    // APEP if the component is unmounted we must clean up.
    componentWillUnmount: function() {
        this.setState({"playing": false});
        this.destoryAudioPlayer();
    },

    // tween the audio for this audio player between a start and end volume value and for a duration
    tweenAudio: function(start, end, duration, audioPlayer) {
        var position = {vol: start};
        var target = {vol: end};
        var player = audioPlayer || this.state.player;
        return new TWEEN.Tween(position)
            .to(target, duration)
            .onUpdate(function() {
                if(this.volume){
                    this.volume(position.vol);
                }
            }.bind(player));
    },

    unlockCuePointsForMediaObject: function(mediaObject){
        // Ensure that the cue point events are unlocked - the source of locking is after they've triggered within the time handler
        // We unlock them at the start of play to allow them to be triggered again
        var cues = mediaObject.cuePointEvents || [];
        for (var i = 0; i < cues.length; i++) {
            if(cues[i].locked){
                cues[i].locked = false;
            }
        }
    },

    // APEP looping handler to determine autoreplay values
    loopingHandler: function() {
        var self = this;

        this.setState({currentLoop: this.state.currentLoop + 1});

        // APEP if the current loop matches or is higher, the audio element is complete
        if(this.state.currentLoop >= this.state.autoreplay) {
            self.transition();
        } else {
            console.log("AudioMediaObject - loopingHandler - Loop again - currentLoop: , autoreplay: ", this.state.currentLoop, this.state.autoreplay);
            self.state.player.seek(0);
            self.state.player.play();
            var mediaObject = self.props.data.mediaObject._obj;
            self.unlockCuePointsForMediaObject(mediaObject);
        }

    },

    audioPlayerTimeUpdate: function (position, duration) {

        var mediaObject = this.props.data.mediaObject._obj;

        var cues = mediaObject.cuePointEvents || [];

        var _ops = this.props.data.mediaObject._ops;

        var transitionSeconds = (_ops.transitionDuration || 10) / 1000;

        var self = this;

        if (cues.length > 0) {
            for (var i = 0; i < cues.length; i++) {
                try {
                    //We need to turn the time to seconds not miliseconds
                    var cue = cues[i];
                    if (position >= cue.timeElapsed && position < cue.timeElapsed + 1) {
                        if (cue.locked === undefined) {
                            cue.locked = false;
                        }
                        if (!cue.locked) {
                            cue.locked = true;
                            console.log("audio-media-object cue - cue.timeElapsed: , cue.locked: ", cue.timeElapsed, cue.locked);
                            self.props.data.triggerMediaActiveTheme(cue.themes);
                        }
                        cues[i] = cue;
                    }
                } catch (e) {
                    console.log("err", e)
                }
            }
        }

        // APEP we need to allow an audio media object of 0 to only play for duration
        // if autoreplay 0, we want to use data.displayDuration to be able to end an audio track early
        // APEP if autoreplay is 0, follow the displayDuration, else allow the audio object to fully play & handle looping
        if (self.state.autoreplay === 0) {
            if((position + transitionSeconds) > (self.props.data.displayDuration / 1000)) {
                self.loopingHandler();
            }
        } else {
            // APEP if we are within transitionSeconds of the end of the clip, or the duration of the full audio track is shorter than transitionSeconds
            // Loop or finish the audio media object
            if ((duration - position) < transitionSeconds || duration < transitionSeconds) {
                self.loopingHandler();
            }
        }

    },

    audio5Play: function(mediaObject, streamUrl) {

        var self = this;

        var volume = mediaObject.volume;
        if (isNaN(volume)) {
            volume = 100;
        }
        volume = volume / 100;

        self.state.player = new Audio5({
            throw_errors: false,
            format_time: false,
            ready: function() {
                if(!self.state.playing) {
                    return;
                }

                this.load(streamUrl);

                // APEP TODO resolve audio volume bug then we can turn this back on
                this.volume(volume);

                self.unlockCuePointsForMediaObject(mediaObject);

                this.play();

                //APEP tween volume TODO Turn back on with time to diagnose
                var _ops = self.props.data.mediaObject._ops;
                // self.state.playingAudioTween = self.tweenAudio(0, volume, _ops.transitionDuration, this);
                // self.state.playingAudioTween.start();

                this.on('timeupdate', self.audioPlayerTimeUpdate);

                this.on('error', function(err) {
                    self.destoryAudioPlayer();
                });
            }
        });
    },

    play: function() {

        var mediaObject = this.props.data.mediaObject._obj;

        if(!this.state.playing) {
            return;
        }

        var self = this;

        // APEP soundcloud audio - a simple search of the URL is OK.
        if (mediaObject.url.indexOf("soundcloud.com") !== -1) {
            soundCloud.streamUrl(mediaObject.url, function(err, streamUrl) {
                if(err) {
                    // APEP if we get an error from soundcloud, we will not be able to play the audio file. clean up immediately
                    self.destoryAudioPlayer();
                }

                self.audio5Play(mediaObject, streamUrl);
            });
        } else {
            // APEP TODO Must check if it is transcoded.  We will need the full scene object with appended DB values

            // var transcodedUrl = AudioUtils.getTranscodedUrl(mediaObject.url);

            self.audio5Play(mediaObject, mediaObject.url);
        }
    },

    destoryAudioPlayer: function() {
        // APEP Ensure the Audio5 component cleans up
        if(this.state.player) {
            this.state.player.pause();
            this.state.player.destroy();
            this.state.player.off("timeupdate", this.audioPlayerTimeUpdate);
            this.setState({player: null});
            this.props.data.moDoneHandler(this);
        }
    },

    transition: function() {

        // console.log("AudioMediaObject - transition called");

        var self = this;

        // APEP Make sure to stop the initial audio tween
        if(this.state.playingAudioTween) {
            this.state.playingAudioTween.stop();
        }

        // APEP Make sure we are still playing, if not we are trying to transition this element out and do not need to handle this anymore
        if(this.state.playing) {
            this.setState({"playing": false});
            if(self.state.player) {
                self.state.player.off("timeupdate", self.audioPlayerTimeUpdate);

                self.destoryAudioPlayer();

                // APEP TODO the below is causing errors, with the tween that is starting ends up with null pointers
                // var _ops = self.props.data.mediaObject._ops;
                /*self.tweenAudio(self.state.player.volume(), 0, _ops.transitionDuration, self.state.player)
                    .onComplete(function() {
                        console.log("Audio Tween Completed");
                    })
                    .start();*/
            }
        }
    },

    render: function() {
        return <span ref={this.props.data.mediaObject._obj._id} />;
    }

});

module.exports = AudioMediaObject;
