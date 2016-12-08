'use strict';
var React = require('react');
var getVimeoId = require('../../../utils/get-vimeo-id');
var VideoMediaPreviewPlayer = React.createClass({

    _getMediaObject: function (props) {
        var scenes = props.scene;
        var currentMediaItemIndex = props.focusedMediaObject;
        return scenes.scene[currentMediaItemIndex] || null;
    },

    getInitialState: function() {
        return {

        };
    },

    _getVimeoPlayerForMediaObject: function(mediaObject) {
        var vimeoId = getVimeoId(mediaObject.url);
        var url = 'https://player.vimeo.com/video/' + vimeoId;
        return <iframe ref="videoPlayer" width="100%" height="100%" src={url}></iframe>;
    },

    _getMediaObjectUrl: function(mediaObject) {
        var dashUrl = mediaObject.url.replace("raw", "transcoded/dash");

        var trailingSlash = dashUrl.lastIndexOf("/");
        dashUrl = dashUrl.substring(0, trailingSlash);
        dashUrl += '/video_manifest.mpd';

        return dashUrl;
    },

    /**
     * Provides standard video playback of transcoded dash stream of raw file
     *
     * APEPE: We do not have the video media object database value at this point
     * Ultimately, we would need websockets and a store for all the video media objects
     * @returns {XML: Video HTML component}
     */
    _getDashPlayer: function(mediaObject) {
        console.log("getting dash player", this._getMediaObjectUrl(mediaObject))
        var dashUrl =  this._getMediaObjectUrl(mediaObject)
        // dashUrl = "Transcoding_3/video_manifest.mpd";  //APEP: Use dash transcoded from a local express file path (dist folder)  CORS issue as azure storage account does not like localhost:port
        return <video ref="videoPlayer" data-dashjs-player id="example-video"  width="100%" height="320px" controls>
            <source src={dashUrl} type="application/dash+xml"></source>
        </video>;
    },

    /**
     * Provides standard video playback of raw uploaded file
     * @returns {XML: Video HTML component}
     */
    _getFilePlayer: function(mediaObject) {
        return <video width="100%" height="100%" controls>
            <source src={mediaObject.url}></source>
        </video>;
    },

    _getRawPlayerForMediaObject: function(mediaObject) {

        return this._getDashPlayer(mediaObject);

        // APEPE: We do not have the video media object database value at this point
        // Ultimately, we would need websockets and a store for all the video media objects
        // if(mediaObject.hasTranscoded) {
        // }
        //
        // return this._getFilePlayer(mediaObject);
    },

    getVideoPlayerForMediaObject: function(mediaObject) {
        if(!mediaObject) {
            return;
        }

        if(mediaObject.url.indexOf('vimeo.com') != -1) {
            return this._getVimeoPlayerForMediaObject(mediaObject);
        }

        return this._getRawPlayerForMediaObject(mediaObject);
    },

    componentDidUpdate: function() {

        var mediaObject = this._getMediaObject(this.props);

        if(! mediaObject){
            return;
        }

        var url = this._getMediaObjectUrl(mediaObject);
        // var url = "Transcoding_3/video_manifest.mpd"; //APEP see other comment (_getRawPlayerForMediaObject)
        var player = dashjs.MediaPlayer().create();
        player.initialize(document.querySelector("#example-video"), url, true);
    },

    render: function() {

        var mediaObject = this._getMediaObject(this.props);

        var video = this.getVideoPlayerForMediaObject(mediaObject);
        console.log("player-preview",this)
        //this.refs.videoPlayer.autoplay = false;

        return (
            <div style={{width: '100%', height: '320px'}}>
                {video}
            </div>
        );
    }

});

module.exports = VideoMediaPreviewPlayer;
