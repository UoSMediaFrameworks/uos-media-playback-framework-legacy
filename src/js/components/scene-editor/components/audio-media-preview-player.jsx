'use strict';
var React = require('react');
var _ = require('lodash');
var soundCloud = require('../../../utils/sound-cloud');

var AudioMediaPreviewPlayer = React.createClass({
    getInitialState: function () {
        return {
            previewReact:null
        };
    },
    getSoundPreviewElement:function(props){
        if (!props.mediaObject) {
            return (
                <span></span>
            );
        } else {
            if (props.mediaObject.url.indexOf("soundcloud.com") !== -1) {
                soundCloud.streamUrl(props.mediaObject.url, function (err, streamUrl) {
                    if (err) {
                        return (
                            <span></span>
                        );
                    } else {
                        return (
                            <audio
                                id={props.id}
                                className="react-audio-player"
                                src={streamUrl}
                                controls>
                            </audio>
                        )
                    }
                });
            } else {
                return (
                    <audio
                        id={props.id}
                        className="react-audio-player"
                        src={props.mediaObject.url}
                        controls>
                    </audio>
                )
            }
        }
    },
    componentWillReceiveProps(nextProps,nextState){
        var element = this.getSoundPreviewElement(nextProps);
        this.setState({previewReact:element})
    },
    render: function () {
        if(this.state.previewReact){
            return this.state.previewReact;
        }else{
            return null;
        }

    }
});

module.exports = AudioMediaPreviewPlayer;
