'use strict';
var React = require('react');
var getVimeoId = require('../../../utils/get-vimeo-id');
var EmbeddedVimeoPlayer = require('../../../utils/embedded-vimeo-player');
var classNames = require('classnames');

var VideoMediaObject = React.createClass({
        getInitialState: function () {
            return {
                shown: false,
                volume: 0.001,
                looping: false,
                playbackTimeInterval: null,
                player: null,
                play_duration: null
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
            //console.log("mounted")
            var self = this;
            var mediaObject = this.props.data.mediaObject;
            var isVimeo = mediaObject._obj.url.indexOf("vimeo.com") !== -1;
            var videoUrl = isVimeo ? getVimeoId(mediaObject._obj.url) : mediaObject._obj.url;
            self.state.looping = !(mediaObject._obj.autoreplay == undefined || mediaObject._obj.autoreplay < 1);
            self.state.volume = self.getVolume(mediaObject);
            self.state.player = new EmbeddedVimeoPlayer(isVimeo, videoUrl);

            if (!self.state.player.isVimeo) { //APEP: ##Hack## for buffering media removal at the end
                try {
                    //APEP: ##Hack## for buffering media removal at the end
                    self.state.player.raw_player.retrieveManifest(self.state.player.player_url, function (manifest, err) {
                        if (err) {
                            console.log("VideoReactErr", err)
                            self.state.play_duration = null;
                        }else{
                            self.state.play_duration = manifest.Period.duration;
                        }

                    });

                } catch (e) {
                    console.log("e component did mount: ", e);
                }
            }

            var element = this.refs[this.props.data.mediaObject._obj._id];
            element.appendChild(this.state.player._element);

            console.log("Video state", this.state);

            this.play();
        },
        play: function () {

            var self = this;
            if (self.state.player.isVimeo) {
                self.state.player.vimeo_player.setVolume(self.state.volume || 0.00001);
                self.state.player.vimeo_player.play();
                // this.state.player.vimeo_player.setLoop(this.state.looping || false);
            } else {
                self.state.player.raw_player.play();
                self.state.player.raw_player.setVolume(this.state.volume || 0.0);
            }

            var element = self.refs[self.props.data.mediaObject._obj._id];
            var transitionSeconds = self.props.data.transitionDuration / 1000;
            element.style.transition = 'opacity ' + (self.props.data.transitionDuration / 1000) + 's ease-in-out';


            self.setState({shown: true});
            if (self.state.player.isVimeo) {
                self.state.player.onPlayProgress(function (data) {
                    if ((data.duration - data.seconds) < transitionSeconds || data.duration < transitionSeconds) {
                        console.log("Transition video player out - vimeo");
                        self.transition();
                    }
                });
                self.state.player.vimeo_player.on('ended', function (e) {
                    self.transition();
                });

            } else {

                try {
                    self.state.player._element.addEventListener('ended', function (e) {
                        console.log("Raw event Ended", e);
                        self.transition();
                    }, false);
                    //APEP: ##Hack## for buffering media removal at the end
                    if (self.state.play_duration !== null && self.state.play_duration > 0) {
                        if (self.state._playbackTimeInterval) clearTimeout(self.state._playbackTimeInterval);
                        self.state._playbackTimeInterval = setTimeout(function () {
                            console.log("Buffering play duration failure - transition media object: ", self);
                            self.transition();
                        }, self.state.play_duration * 1.15 * 1000);
                    }
                } catch (e) {
                    console.log("Raw Player Error", e)
                }

            }

        },
        transition: function () {
            //console.log("VideoMediaObject - transition - Video transition call made");
            var self = this;
            if (self.state._playbackTimeInterval) clearTimeout(self.state._playbackTimeInterval);
            if (self.props.data.mediaObject.type === "video" && self.props.data.mediaObject._obj.autoreplay <= 1) {
                self.setState({shown: false});
            }

            if (self.props.data.mediaObject) {
                self.props.data.moDoneHandler(self);
            }
        }
        ,
        render: function () {
            var objectClasses = classNames({
                "video-media-object": true,
                "media-object": true,
                "show-media-object": this.state.shown
            });
            return (<div ref={this.props.data.mediaObject._obj._id}
                         className={objectClasses}></div>);
        }
    })
    ;
module.exports = VideoMediaObject;
