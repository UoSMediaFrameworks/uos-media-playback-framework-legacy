'use strict';
var React = require('react');

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
        return <iframe width="100%" height="100%" src={url}></iframe>;
    },

    _getMediaObjectUrl: function(mediaObject) {
        var dashUrl = mediaObject.url.replace("raw", "transcoded/dash");

        var trailingSlash = dashUrl.lastIndexOf("/");
        dashUrl = dashUrl.substring(0, trailingSlash);
        dashUrl += '//video_manifest.mpd';

        return dashUrl;
    },

    _getRawPlayerForMediaObject: function(mediaObject) {

        var dashUrl =  this._getMediaObjectUrl(mediaObject);
        // dashUrl = "Transcoding_3/video_manifest.mpd";  //APEP: Use dash transcoded from a local express file path (dist folder)  CORS issue as azure storage account does not like localhost:port
        return <video ref="videoPlayer" data-dashjs-player id="example-video" className="video-js " width="100%" height="320px" controls>
            <source src={dashUrl} type="application/dash+xml"></source>
        </video>;
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

        if(!this._getMediaObject(this.props)){
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

        console.log("video: ", video);

        return (
            <div style={{width: '100%', height: '320px'}}>
                {video}
            </div>
        );
    }

});

module.exports = VideoMediaPreviewPlayer;
