var React = require('react');
var Audio5 = require('audio5');
var soundCloud = require('../../../utils/sound-cloud');
var TWEEN = require('tween.js');

var AudioMediaObject = React.createClass({

    typeName: "audio",

    getInitialState: function () {
        return {
            playing: true
        };
    },

    componentDidMount: function() {
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
                    if(self.state.playing) {
                        this.load(streamUrl);
                        this.volume(0);
                        var cues = mediaObject.cues || [];
                        for (var i = 0; i < cues.length; i++) {
                            if(cues[i].locked){
                                cues[i].locked = false;
                            }
                        }
                        this.play();

                        var _ops = self.props.data.mediaObject._ops;

                        //APEP tween volume
                        self.tweenAudio(0, volume, _ops.transitionDuration).start();

                        var transitionSeconds = (_ops.transitionDuration || 10) / 1000;

                        this.on('timeupdate', function (position, duration) {
                            if (cues != []) {
                                for (var i = 0; i < cues.length; i++) {
                                    try {
                                        //We need to turn the time to seconds not miliseconds
                                        var cue = cues[i];
                                        if (position >= cue.timeSinceStartOfVideo && position < cue.timeSinceStartOfVideo + 1) {
                                            if (cue.locked == undefined) {
                                                cue.locked = false;
                                            }
                                            if (!cue.locked) {
                                                cue.locked = true;
                                                console.log("audio-media-object cue");
                                                self.props.data.triggerMediaActiveTheme(cue.themes);
                                            }
                                            cues[i] = cue;
                                        }
                                    } catch (e) {
                                        console.log("err", e)
                                    }
                                }
                                if ((duration - position) < transitionSeconds || duration < transitionSeconds) {
                                    self.transition();
                                }
                            }
                        });
                        this.on('error', function(err) {
                            self.transition();
                        });
                    }
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
