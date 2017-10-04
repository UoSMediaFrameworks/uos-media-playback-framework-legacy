'use strict';
var React = require('react');
var _ = require('lodash');
var soundCloud = require('../../../utils/sound-cloud');

var AudioMediaPreviewPlayer = React.createClass({
    getInitialState: function () {
        return {
        };
    },

    render: function () {
        if (!this.props.mediaObject) {
            return (
                <span></span>
            );
        } else {
            if (this.props.mediaObject.url.indexOf("soundcloud.com") !== -1) {
                soundCloud.streamUrl(this.props.mediaObject.url, function (err, streamUrl) {
                    if (err) {
                        return (
                            <span></span>
                        );
                    } else {
                        return (
                            <audio
                                id={this.props.id}
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
                        id={this.props.id}
                        className="react-audio-player"
                        src={this.props.mediaObject.url}
                        controls>
                    </audio>
                )
            }
        }
    }
});

module.exports = AudioMediaPreviewPlayer;
