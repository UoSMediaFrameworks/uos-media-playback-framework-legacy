'use strict';
var React = require('react');
var soundCloud = require('../../utils/sound-cloud');
var getVimeoId = require('../../utils/get-vimeo-id');
var toastr = require('toastr');
var hat = require('hat');
var VideoMediaPreviewPlayer = require('./components/video-media-preview-player.jsx');
var _ = require('lodash');

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
    _cssToReactCSS: function (styleObject) {
        var ReactStyleObj = {};
        if (!styleObject) {
            throw new Error('missing css text to transform');
        }

        _.forEach(Object.keys(styleObject), function (styleKey) {
            var styleValue = styleObject[styleKey];
            var name = styleKey.replace(/(-.)/g, function (v) {
                return v[1].toUpperCase();
            });
            ReactStyleObj[name] = styleValue;
        });
        return ReactStyleObj;
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
            case 'text':
                var preview;
                var self = this;
                var text = "Undefined";
                var style = {};
                if (self.props.focusedMediaObject != undefined) {
                    style =props.scene.scene[props.focusedMediaObject].style;
                    text = props.scene.scene[props.focusedMediaObject].text;
                }
                preview = <p style={ this._cssToReactCSS(style)}>{text}</p>;
                self.setState({preview: preview, previewClass: 'media-object-item-preview-player text-container'});
                break;
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
                preview = <img id={uniqueComponentKey} width="640" height="320" src={mediaObject.url}></img>
                this.setState({preview: preview, previewClass: 'media-object-item-preview-player'});
                break;
        }
    },
    setupState: function (props) {
        this.setState(this.getInitialState());
        console.log("componentWillReceiveProps",props)
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
        var reactStyle = {};

        if(this.props.scene !=undefined){
            reactStyle = this._transform(this.props.scene.style);
        }


        return <div ref="preview" className={this.state.previewClass} style={reactStyle}>
            {this.state.preview}
        </div>;
    }

});

module.exports = MediaObjectPreviewPlayer;
