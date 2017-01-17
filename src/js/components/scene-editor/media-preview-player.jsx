'use strict';
var React = require('react');
var soundCloud = require('../../utils/sound-cloud');
var getVimeoId = require('../../utils/get-vimeo-id');
var toastr = require('toastr');
var hat = require('hat');
var VideoMediaPreviewPlayer = require('./components/video-media-preview-player.jsx');

var MediaObjectPreviewPlayer = React.createClass({
    getInitialState: function () {
        return {
            preview: <p className='media-object-list-instructions'>Click on audio/video thumbnail to preview</p>,
            previewClass: 'media-object-item-preview-player-hidden'
        };
    },
    _getMediaObject: function (props) {
        var scenes = props.scene;
        var currentMediaItemIndex = props.focusedMediaObject;
        return scenes.scene[currentMediaItemIndex] || null;
    },

    previewMediaObject: function (props) {
        var uniqueComponentKey = hat();
        if (props.focusedMediaObject === null) {
            var preview = <span></span>;
            this.setState({preview: preview, previewClass: ''});
            return;
        }

        var mediaObject = this._getMediaObject(props);

        if (!mediaObject) {
            var preview = <span></span>;
            this.setState({preview: preview, previewClass: ''});
            return;
        }

        switch (mediaObject.type) {
            case 'audio':
                var self = this; //APEP required for scope resolution within the soundcloud stream URL callback.
                soundCloud.streamUrl(mediaObject.url, function (err, streamUrl) {
                    var preview;
                    if (err) {
                        toastr.warning(err)
                    } else {
                        preview = <audio
                            id={uniqueComponentKey}
                            className="react-audio-player"
                            src={streamUrl}
                            controls>
                        </audio>;
                    }
                    self.setState({preview: preview, previewClass: 'media-object-item-preview-player'});
                });
                break;

            case 'video':

                var preview = <VideoMediaPreviewPlayer id={uniqueComponentKey} scene={this.props.scene}
                                                       focusedMediaObject={this.props.focusedMediaObject}></VideoMediaPreviewPlayer>
                this.setState({preview: preview, previewClass: 'media-object-item-preview-player'});
                break;
            case 'image':
                preview = <img id={uniqueComponentKey} className="react-image-preview" src={mediaObject.url}></img>
                this.setState({preview: preview, previewClass: 'media-object-item-preview-player'});
                break;
        }
    },

    setupState: function (props) {
        this.setState(this.getInitialState());
        if (props) {
            this.previewMediaObject(props);
        }
    },

    componentWillMount: function () {
        this.setState(this.getInitialState());
    },

    componentWillReceiveProps: function (nextProps) {
        this.setupState(nextProps);
    },
    componentWillUnmount: function () {
        this.setState(this.getInitialState())
    },

    render: function () {
        return <div className={this.state.previewClass}>
            {this.state.preview}
        </div>;
    }

});

module.exports = MediaObjectPreviewPlayer;
