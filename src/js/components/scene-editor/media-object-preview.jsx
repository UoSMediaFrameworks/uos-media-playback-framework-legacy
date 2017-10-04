'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var soundCloud = require('../../utils/sound-cloud');
var vimeoApi = require('../../utils/vimeo-api');
var getVimeoId = require('../../utils/get-vimeo-id');

var getImageMediaObjectThumbnailUrl = function(mediaObjectUrl) {
    if(!mediaObjectUrl || mediaObjectUrl.length === 0) {
        return mediaObjectUrl;
    }

    if(mediaObjectUrl.indexOf(process.env.AZURE_CDN_URL) === -1) {
        return mediaObjectUrl;
    }

    var trailingSlash = mediaObjectUrl.lastIndexOf('/');
    return mediaObjectUrl.substring(0, trailingSlash + 1) + "thumbnail-" + mediaObjectUrl.substring(trailingSlash + 1, mediaObjectUrl.length);
};

var getFilenameFromUrl = function(url) {
    return url.substring(url.lastIndexOf('/')+1);
};

var MediaObjectPreview = React.createClass({

	getInitialState: function() {
		return {
			thumbImage: undefined,
			title: ''
		};
	},

    loadSoundcloudThumbnailAndTitle: function(mediaObject) {
        soundCloud.waveformUrl(mediaObject.url, function(err,url) {
            if(!err){
                this.setState({thumbImage: url});
            }
        }.bind(this));
        soundCloud.title(mediaObject.url, function(err,title) {
            if(!err){
                this.setState({title: title});
            }
        }.bind(this));
    },

    loadAudioTitle: function(mediaObject) {
	    this.setState({title: getFilenameFromUrl(mediaObject.url)});
    },

	loadObjectExtras: function(mediaObject) {

        if(!mediaObject || !mediaObject.type) {
            return;
        }

		switch(mediaObject.type) {
			case 'audio':
			    if(mediaObject.url.indexOf('soundcloud.com') !== -1) {
                    this.loadSoundcloudThumbnailAndTitle(mediaObject);
                } else {
			        this.loadAudioTitle(mediaObject);
                }
				break;

			case 'video':
                if(mediaObject.url.indexOf('vimeo.com') !== -1) {
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
                }
				break;

			case 'text':
				this.setState({
                    title: mediaObject.text
                });
				break;

            case 'image':
                this.setState({
                    img: mediaObject,
                    thumbImage: getImageMediaObjectThumbnailUrl(mediaObject.url)
                });
                break;
		}

	},

	setupState: function(mediaObject) {
		this.setState(this.getInitialState());
		this.loadObjectExtras(mediaObject);
	},

	componentWillMount: function() {
		this.setupState(this.props.mediaObject);
	},

	componentWillReceiveProps: function(nextProps) {
		this.setupState(nextProps.mediaObject);
	},

	render: function() {
		var type = this.props.mediaObject.type,
			extra;

		switch(type) {
		 	case 'image':
                extra = <img src={this.state.thumbImage}/>;
		 		break;
		 	case 'video':
		 		if (this.state.thumbImage) {
		 			extra = <div className='icon-wrapper'>
		 				<img src={this.state.thumbImage} />
		 				<Glyphicon className='icon' icon='facetime-video' />
		 			</div>;
		 		} else {
		 			extra = <Glyphicon className='icon' icon='facetime-video' />;
		 		}
		 		break;
		 	case 'audio':
		 		if (this.state.thumbImage) {
		 			extra = <img className='waveform-url' src={this.state.thumbImage} />;
		 		} else {
		 			extra = <Glyphicon className='icon' icon='volume-up' />;
		 		}

		 		break;
		 	case 'text':
		 		extra = <Glyphicon className='icon' icon='font' />;
		 		break;
		 }

		 var title = <span className='preview-title'>{this.state.title}</span>;

		return <div className='media-object-item-preview'>
			{extra}
			{this.props.children}
			{title}

		</div>;
	}
});

module.exports = MediaObjectPreview;
