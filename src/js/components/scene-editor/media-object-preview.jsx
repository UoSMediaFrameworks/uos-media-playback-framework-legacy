'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var soundCloud = require('../../utils/sound-cloud');
var vimeoApi = require('../../utils/vimeo-api');
var getVimeoId = require('../../utils/get-vimeo-id');
var ImgLoader = require('react-image').default;
var FontAwesome = require('react-fontawesome');

var getImageMediaObjectThumbnailUrl = function (mediaObjectUrl) {
    if (!mediaObjectUrl || mediaObjectUrl.length === 0) {
        return mediaObjectUrl;
    }

    if (mediaObjectUrl.indexOf(process.env.AZURE_CDN_URL) === -1) {
        return mediaObjectUrl;
    }

    var trailingSlash = mediaObjectUrl.lastIndexOf('/');
    return mediaObjectUrl.substring(0, trailingSlash + 1) + "thumbnail-" + mediaObjectUrl.substring(trailingSlash + 1, mediaObjectUrl.length);
};

var getFilenameFromUrl = function (url) {
    return url.substring(url.lastIndexOf('/') + 1);
};

var MediaObjectPreview = React.createClass({

    getInitialState: function () {
        return {
            thumbImage: undefined,
            title: ''
        };
    },


    loadSoundcloudThumbnailAndTitle: function (mediaObject) {
        soundCloud.waveformUrl(mediaObject.url, function (err, url) {
            if (!err) {
                this.setState({thumbImage: url});
            }
        }.bind(this));
        soundCloud.title(mediaObject.url, function (err, title) {
            if (!err) {
                this.setState({title: title});
            }
        }.bind(this));
    },

    loadAudioTitle: function (mediaObject) {

        this.setState({title: getFilenameFromUrl(mediaObject.url)});
    },

    loadObjectExtras: function (mediaObject) {

        if (!mediaObject || !mediaObject.type) {
            return;
        }
        console.log(mediaObject.type)
        switch (mediaObject.type) {
            case 'audio':
                if (mediaObject.url.indexOf('soundcloud.com') !== -1) {
                    this.loadSoundcloudThumbnailAndTitle(mediaObject);
                } else {
                    this.loadAudioTitle(mediaObject);
                }
                break;

            case 'video':
                if (mediaObject.url.indexOf('vimeo.com') !== -1) {
                    vimeoApi.video(getVimeoId(mediaObject.url), function (err, data) {
                        var url;
                        try {
                            url = data.pictures.sizes[0].link;
                        } catch (err) {
                            console.log('couldn\'t extract vimeo thumb url from api request');
                        }
                        this.setState({
                            thumbImage: url,
                            title: data.name
                        });
                    }.bind(this));
                } else {
                    this.setState({title: this.loadAudioTitle(mediaObject)});
                }
                ;
                break;

            case 'text':
                this.setState({
                    title: mediaObject.text
                });
                break;

            case 'image':
                var fullImage = mediaObject.url
                var thumbImage = getImageMediaObjectThumbnailUrl(mediaObject.url)
                this.setState({
                    imgUrlWithFallback: [thumbImage, fullImage]
                });
                break;
        }

    },

    setupState: function (mediaObject) {
        this.setState(this.getInitialState());
        this.loadObjectExtras(mediaObject);
    },

    componentWillMount: function () {
        this.setupState(this.props.mediaObject);
    },

    componentWillReceiveProps: function (nextProps) {
        this.setupState(nextProps.mediaObject);
    },

    render: function () {
        var type = this.props.mediaObject.type,
            title, extra;
        var self = this;
        switch (type) {
            case 'image':
                extra = <ImgLoader
                    src={this.state.imgUrlWithFallback}
                    loader={<FontAwesome
                        className="mf-media-loader-spinner"
                        name='spinner'
                        size='1x'
                        spin
                        style={{
                            textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)'
                        }}
                    />}
                />;
                break;
            case 'video':
                if (this.state.thumbImage) {
                    extra = <div className='icon-wrapper'>
                        <img src={this.state.thumbImage}/>
                        <Glyphicon className='icon' icon='facetime-video'/>
                    </div>;
                } else {
                    extra = <Glyphicon className='icon' icon='facetime-video'/>;
                }
                break;
            case 'audio':
                if (this.state.thumbImage) {
                    extra = <img className='waveform-url' src={this.state.thumbImage}/>;
                } else {
                    extra = <Glyphicon className='icon' icon='volume-up'/>;
                }

                break;
            case 'text':
                extra = <Glyphicon className='icon' icon='font'/>;
                break;
        }

        switch (type) {
            case 'image':
            case 'audio':
            case 'video':
                title = <span className='preview-title'>{getFilenameFromUrl(self.props.mediaObject.url)}</span>;
                break;
            case 'text':
                title = <span className='preview-title'>{self.props.mediaObject.text}</span>;
                break;
        }

        return <div className='media-object-item-preview'>
            {extra}
            {this.props.children}
            {title}

        </div>;
    }
});

module.exports = MediaObjectPreview;
