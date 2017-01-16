'use strict';
var React = require('react');
var getVimeoId = require('../../../utils/get-vimeo-id');
var videoUtils = require('../../../utils/video-utils');
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
        preloadVideoInfo: function (currentVideoObject) {
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
        },
        reinitializeVideo: function (currentVideoObject) {
            console.log("reinitializeVideo", currentVideoObject, this.state.videoInfo.data);
            var videoElement = document.getElementById('videoPreview');
            if (videoElement != null) {
                videoElement.load();
            }
            if (this.state.videoInfo.data.hasTranscoded) {
                console.log("yo", currentVideoObject)
                var url = videoUtils.getTranscodedUrl(currentVideoObject.url);
                var player = dashjs.MediaPlayer().create();
                player.initialize(document.querySelector("#videoPreview"), url, false);
            }
        },
        _getVimeoPlayerForMediaObject: function (mediaObject) {
            var vimeoId = getVimeoId(mediaObject.url);
            var url = 'https://player.vimeo.com/video/' + vimeoId;
            return <iframe ref="videoPlayer" width="100%" height="100%" src={url}></iframe>;
        },
        /**
         * Provides standard video playback of transcoded dash stream of raw file
         *
         * APEPE: We do not have the video media object database value at this point
         * Ultimately, we would need websockets and a store for all the video media objects
         * Angel P: We now have the value in but it only gets returned from the store
         * @returns {XML: Video HTML component}
         */
        _getDashPlayer: function (mediaObject) {

            var dashUrl = videoUtils.getTranscodedUrl(mediaObject.url);
            //Angel P: The fallbacksource has been moved up so we can use it as a fallback if the transcoded
            // value can't be reached (localhost)

            var rawVideoObjSource = videoUtils.getRawVideoDirectPlaybackSupport(mediaObject.url);
            var fallbackSource = rawVideoObjSource.type !== "unsupported" ?
                <source src={rawVideoObjSource.url} type={rawVideoObjSource.type}></source> : "";
            var video = <div> Video is not transcoded and/or not supported for direct playback</div>;
            if (this.state.videoInfo.data.hasTranscoded) {
                video = <video data-dashjs-player id="videoPreview" width="100%" height="320px" controls>
                    {fallbackSource}
                    <source src={dashUrl} type="application/dash+xml"></source>
                </video>;
            } else {
                if (fallbackSource) {
                    video = <video data-dashjs-player id="videoPreview" width="100%" height="320px" controls>
                        {fallbackSource}
                    </video>;
                }
            }
            console.log(video)
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
            //TODO: Angel P, revise should update optimization and bad lifecycle planning
            if (this.props.focusedMediaObject != nextProps.focusedMediaObject) {
                return true;
            } else if (this.state != nextState) {
                return true;
            } else {
                return false;
            }
        },
        componentDidMount: function () {
            VideoStore.addChangeListener(this._onChange);
        },
        componentWillUnmount: function () {
            //Angel P - Of amy set state issues happen it will be from this listener not unmounting
            VideoStore.removeChangeListener(this._onChange);
        },
        componentWillReceiveProps: function (nextProps) {
            // the place to update state before render on an update.
            if (this.props.focusedMediaObject != nextProps.focusedMediaObject) {
                this.setState(this.getInitialState);
            }
        },
        componentWillUpdate: function (nextProps) {
            //TODO: Angel P, Think about the event's life cycle and use if necessary

        },
        componentDidUpdate: function () {
            var currentVideoObject = this._getMediaObject(this.props);
            if (this.state.loading) {
                this.preloadVideoInfo(currentVideoObject)
            } else {
                if (!this.state.isVimeo) {
                    this.reinitializeVideo(currentVideoObject);
                }
            }
        },
        render: function () {

            var video = null;
            //Initial value
            if (this.state.isVimeo == null) {
                video = <div>No Video</div>;
            }
            if (!this.state.loading) {
                var currentVideoObject = this._getMediaObject(this.props);
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
