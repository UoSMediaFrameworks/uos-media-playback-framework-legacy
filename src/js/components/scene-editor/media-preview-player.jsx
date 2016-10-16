'use strict'
var React = require('react');
var soundCloud = require('../../utils/sound-cloud');
var getVimeoId = require('../../utils/get-vimeo-id');
var toastr = require('toastr');

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
        var previewContainer = document.getElementsByClassName("media-object-item-preview-player");
        if (props.focusedMediaObject != null) {
            var mediaObject = this._getMediaObject(props);
                previewContainer.innerHTML = '';
            switch (mediaObject.type) {
                case 'audio':
                    var preview
                    soundCloud.streamUrl(mediaObject.url, function (err,streamUrl) {
                        if(err)
                        {
                            toastr.warning(err)
                        }else{
                            preview = <audio
                                className="react-audio-player"
                                src={streamUrl}
                                controls
                            >
                            </audio>;
                        }

                    });
                    this.setState({preview: preview, previewClass: 'media-object-item-preview-player'});
                    break;

                case 'video':
                    var vimeoId = getVimeoId(mediaObject.url)
                    var url = 'https://player.vimeo.com/video/' + vimeoId;
                    var preview = <iframe width="100%" height="100%" src={url}></iframe>
                    this.setState({preview: preview, previewClass: 'media-object-item-preview-player'});
                    break;
            }
            previewContainer.innerHTML = this.state.preview
        }
    },

    setupState: function (props) {
        this.setState(this.getInitialState());
        if (props) {
            this.previewMediaObject(props);
        }
    },

    componentWillMount: function () {
        // console.log(this.props)

        this.setState(this.getInitialState());
    },

    componentWillReceiveProps: function (nextProps) {
        this.setupState(nextProps);
    },

    render: function () {

        return <div className={this.state.previewClass}>
            {this.state.preview}
        </div>;
    }

});

module.exports = MediaObjectPreviewPlayer;
