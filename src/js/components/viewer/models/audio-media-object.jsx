var React = require('react');
var Audio5 = require('audio5');
var soundCloud = require('../../../utils/sound-cloud');
var TWEEN = require('tween.js');

var AudioMediaObject = React.createClass({

    typeName: "audio",

    getInitialState: function () {
        return {
            playing: true,
            autoreplay: 0,
            currentLoop: 0
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

    // tween the audio for this audio player between a start and end volume value and for a duration
    tweenAudio: function(start, end, duration) {
        var position = {vol: start};
        var target = {vol: end};
        var self = this;
        return new TWEEN.Tween(position)
            .to(target, duration)
            .onUpdate(function() {
                self.state.player.volume(position.vol);
            });
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

    play: function() {

        var mediaObject = this.props.data.mediaObject._obj;

        if(!this.state.playing) {
            return;
        }

        var self = this;

        soundCloud.streamUrl(mediaObject.url, function(err, streamUrl) {
            if(err) {
                throw err;
                return;
            }

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
                    this.volume(0);

                    self.unlockCuePointsForMediaObject(mediaObject);

                    this.play();

                    var _ops = self.props.data.mediaObject._ops;

                    //APEP tween volume
                    self.tweenAudio(0, volume, _ops.transitionDuration).start();

                    var transitionSeconds = (_ops.transitionDuration || 10) / 1000;

                    var cues = mediaObject.cuePointEvents || [];

                    this.on('timeupdate', function (position, duration) {
                        if (cues.length > 0) {
                            for (var i = 0; i < cues.length; i++) {
                                try {
                                    //We need to turn the time to seconds not miliseconds
                                    var cue = cues[i];
                                    if (position >= cue.timeElapsed && position < cue.timeElapsed + 1) {
                                        if (cue.locked == undefined) {
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

                        if ((duration - position) < transitionSeconds || duration < transitionSeconds) {
                            self.loopingHandler();
                        }
                    });

                    this.on('error', function(err) {
                        self.loopingHandler();
                    });
                }
            })
        });

    },

    transition: function() {

        // console.log("AudioMediaObject - transition called");

        var self = this;

        if(this.state.playing) {

            this.setState({"playing": false});

            if(self.state.player) {
                var _ops = self.props.data.mediaObject._ops;
                self.tweenAudio(self.state.player.volume(), 0, _ops.transitionDuration)
                    .onComplete(function() {
                        self.state.player.pause();
                        // APEP Ensure the Audio5 component cleans up
                        self.state.player.destroy();
                        self.props.data.moDoneHandler(self);
                    })
                    .start();
            }

        }
    },

    render: function() {
        return <span ref={this.props.data.mediaObject._obj._id} />;
    }

});

module.exports = AudioMediaObject;
