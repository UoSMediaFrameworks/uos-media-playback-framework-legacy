'use strict';
var React = require('react');
var getVimeoId = require('../../../utils/get-vimeo-id');
var SceneActions = require('../../../actions/scene-actions');
var VideoStore = require('../../../stores/video-media-object-store');
var _ = require('lodash');
var VideoMediaPreviewPlayer = React.createClass({
        getInitialState: function () {
            return {
                videoInfo: null,
                isVimeo: null,
                loading: true
            };
        },
        _getMediaObject: function (props) {
            var scenes = props.scene;
            var currentMediaItemIndex = props.focusedMediaObject;
            return scenes.scene[currentMediaItemIndex] || null;
        },
        _onChange: function () {
            var currentVideoObject = this._getMediaObject(this.props);
            console.log("_onChange", currentVideoObject)
            if (!currentVideoObject) {
                return;
            }
            if (currentVideoObject.url.indexOf('vimeo.com') == -1) {
                this.setState(this.getStateFromVideoStore(currentVideoObject._id));
            }
        },

        getStateFromVideoStore: function (id) {
            return {
                videoInfo: VideoStore.getVideoInfo(id),
                loading: false
            }
        },


        _getVimeoPlayerForMediaObject: function (mediaObject) {
            console.log("_getVimeoPlayerForMediaObject", mediaObject)
            var vimeoId = getVimeoId(mediaObject.url);
            var url = 'https://player.vimeo.com/video/' + vimeoId;
            return <iframe ref="videoPlayer" width="100%" height="100%" src={url}></iframe>;
        },

        _getMediaObjectUrl: function (mediaObject) {
            var dashUrl = mediaObject.url.replace("raw", "transcoded/dash");
            var trailingSlash = dashUrl.lastIndexOf("/");
            dashUrl = dashUrl.substring(0, trailingSlash);
            dashUrl += '/video_manifest.mpd';
            return dashUrl;
        },

        _getRawMediaObjectSource: function (mediaObject) {
            var supportedVideoFallback = ["ogv", "ogg", "mp4", "webm"];
            var extension = mediaObject.url.substr(mediaObject.url.lastIndexOf('.') + 1);
            var type = "unsupported";
            if (supportedVideoFallback.indexOf(extension) != -1) {
                type = "video/" + extension;
            }
            return {url: mediaObject.url, type: type}
        },

        /**
         * Provides standard video playback of transcoded dash stream of raw file
         *
         * APEPE: We do not have the video media object database value at this point
         * Ultimately, we would need websockets and a store for all the video media objects
         * @returns {XML: Video HTML component}
         */
        _getDashPlayer: function (mediaObject) {
            console.log("getting dash player", this._getMediaObjectUrl(mediaObject));
            var dashUrl = this._getMediaObjectUrl(mediaObject);
            var video = <div> Video is not transcoded and/or not supported for direct playback</div>;
            if (this.state.videoInfo.data.isTranscoded) {
                video = <video data-dashjs-player id="videoPreview" width="100%" height="320px" controls>
                    <source src={dashUrl} type="application/dash+xml"></source>
                </video>;
            } else {
                var rawVideoObjSource = this._getRawMediaObjectSource(mediaObject);
                console.log("raw", rawVideoObjSource)
                var fallbackSource = rawVideoObjSource.type !== "unsupported" ?
                    <source src={rawVideoObjSource.url} type={rawVideoObjSource.type}></source> : "";
                if (fallbackSource) {
                    video = <video data-dashjs-player id="videoPreview" width="100%" height="320px" controls>
                        {fallbackSource}
                    </video>;
                }
            }
            return video;
        },

        /**
         * Provides standard video playback of raw uploaded file
         * @returns {XML: Video HTML component}
         */
        _getFilePlayer: function (mediaObject) {
            return <video width="100%" height="100%" controls>
                <source src={mediaObject.url}></source>
            </video>;
        },

        _getRawPlayerForMediaObject: function (mediaObject) {

            return this._getDashPlayer(mediaObject);
        },

        getVideoPlayerForMediaObject: function (mediaObject) {
            if (!mediaObject) {
                return;
            }
            if (this.state.isVimeo) {
                return this._getVimeoPlayerForMediaObject(mediaObject);
            }
            return this._getRawPlayerForMediaObject(mediaObject);
        },
        shouldComponentUpdate: function (nextProps, nextState) {
            if (this.props.focusedMediaObject != nextProps.focusedMediaObject) {
                return true;
            } else if (this.state != nextState) {
                return true;
            } else {
                return false;
            }
        },
        componentDidMount: function () {
            console.log("mount")
            VideoStore.addChangeListener(this._onChange);
        },
        onWillUnmount: function () {
            console.log("dismount")
            VideoStore.removeChangeListener(this._onChange);
        },
        componentWillReceiveProps: function (nextProps) {
            // the place to update state before render on an update.
            if (this.props.focusedMediaObject != nextProps.focusedMediaObject) {

                this.setState({isVimeo: null, loading: true, videoInfo: null});
                console.log("initiate new video", this.state)
            }
        },
        componentWillUpdate: function (nextProps) {

            //Before it updates anything, check of the props are the same, if they are reset the state
            //if it the same object,

        },
        componentDidUpdate: function () {

            var currentVideoObject = this._getMediaObject(this.props);
            console.log("currentVideoObject", currentVideoObject)
            if (this.state.loading) {
                console.log("loading")
                if (this.state.isVimeo == null) {
                    var isVimeo;
                    isVimeo = currentVideoObject.url.indexOf("vimeo.com") !== -1;
                    this.setState({isVimeo: isVimeo})
                } else {
                    if (!this.state.isVimeo) {
                        SceneActions.getVideoMediaObjectData(currentVideoObject)
                    } else {
                        this.setState({loading: false})
                    }
                }
            } else {
                console.log("loaded")
                if (!this.state.isVimeo) {
                    console.log("loaded from store", this.state)
                    var videoElement = document.getElementById('videoPreview');
                    if (videoElement != null) {
                        console.log("Reloding from video")
                        videoElement.load();
                    }
                    if (this.state.videoInfo.data.hasTranscoded) {
                        var url = this._getMediaObjectUrl(currentVideoObject);
                        var player = dashjs.MediaPlayer().create();
                        player.initialize(document.querySelector("#videoPreview"), url, false);
                    }
                }
            }
        },
        render: function () {
            var currentVideoObject = this._getMediaObject(this.props);
            var video;
            console.log("render", this.state);
            if (this.state.isVimeo == null) {
                video = <div>No Video</div>;
            }
            if (!this.state.loading) {
                video = this.getVideoPlayerForMediaObject(currentVideoObject)
            }
            return (
                <div style={{width: '100%', height: '320px'}}>
                    {video}
                </div>
            );
        }

    })
    ;

module.exports = VideoMediaPreviewPlayer;
