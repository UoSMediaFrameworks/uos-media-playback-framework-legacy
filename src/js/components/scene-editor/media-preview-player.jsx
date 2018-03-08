'use strict';
var React = require('react');
var toastr = require('toastr');
var hat = require('hat');
var VideoMediaPreviewPlayer = require('./components/video-media-preview-player.jsx');
var AudioMediaPreviewPlayer = require('./components/audio-media-preview-player.jsx');
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
        var unwanted_styles = ["position", "max-width", "width", "min-width", "max-height", "height", "min-height", "left", "right", "top", "bottom"]
        var style = props.scene.scene[props.focusedMediaObject].style ? _.cloneDeep(props.scene.scene[props.focusedMediaObject].style) : {};
        for (var i = 0; i < unwanted_styles.length;i++) {

         delete style[unwanted_styles[i]]
        }

        switch (mediaObject.type) {
            case 'text':
                var preview;
                var self = this;
                var text = "Undefined";
                text = props.scene.scene[props.focusedMediaObject].text;
                preview = <p style={ this._cssToReactCSS(style)} dangerouslySetInnerHTML={{__html: text}}></p>;
                self.setState({preview: preview, previewClass: 'media-object-item-preview-player text-container'});
                break;
            case 'audio':
                var self = this; //APEP required for scope resolution within the soundcloud stream URL callback.
                var preview = <AudioMediaPreviewPlayer id={uniqueComponentKey}
                                                        mediaObject={mediaObject}/>;
                self.setState({preview: preview, previewClass: 'media-object-item-preview-player'});
                break;

            case 'video':
                var style = {};
                var preview = <VideoMediaPreviewPlayer id={uniqueComponentKey} scene={props.scene}
                                                       focusedMediaObject={props.focusedMediaObject}
                                                       style={ this._cssToReactCSS(style)}></VideoMediaPreviewPlayer>
                this.setState({preview: preview, previewClass: 'media-object-item-preview-player'});
                break;
            case 'image':

                preview = <img id={uniqueComponentKey} width="640" height="320" src={mediaObject.url}
                               style={ this._cssToReactCSS(style)}></img>
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
        var reactStyle = {};

        if (this.props.scene !== undefined) {
            reactStyle = this._cssToReactCSS(this.props.scene.style);
        }


        return <div ref="preview" className={this.state.previewClass} style={Object.assign({},{height: "100%", width: "100%"},reactStyle)}>
            {this.state.preview}
        </div>;
    }

});

module.exports = MediaObjectPreviewPlayer;
