'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var soundCloud = require('../../utils/sound-cloud');
var vimeoApi = require('../../utils/vimeo-api');
var getVimeoId = require('../../utils/get-vimeo-id');

var MediaObjectPreview = React.createClass({

	getInitialState: function() {
		return {
			thumbImage: undefined 
		};
	},

	loadThumbImage: function(url) {
		var mo = this.props.mediaObject;
		if (! this.state.thumbImage) {
			switch(mo.type) {
				case 'audio':
					soundCloud.waveformUrl(mo.url, function(url) {
						// triggers invariant violation sometimes
						this.setState({thumbImage: url});
					}.bind(this));
					break;

				case 'video':
					vimeoApi.video(getVimeoId(mo.url), function(err, data) {
						this.setState({thumbImage: data.pictures.sizes[0].link});
					}.bind(this));
					break;		
			}
		}
	},

	componentWillMount: function() {
		this.loadThumbImage();
	},

	componentWillReceiveProps: function(nextProps) {
		this.loadThumbImage();	
	},

	render: function() {
		var type = this.props.mediaObject.type,
			extra;

		switch(type) {
		 	case 'image':
		 		extra = <img src={this.props.mediaObject.url} />;
		 		break;
		 	case 'video': 
		 		if (this.state.thumbImage) {
		 			extra = <img src={this.state.thumbImage} />;	
		 		} else {
		 			extra = <Glyphicon icon='facetime-video' />;
		 		}
		 		break;
		 	case 'audio':
		 		if (this.state.thumbImage) {
		 			extra = <img className='waveform-url' src={this.state.thumbImage} />;	
		 		} else {
		 			extra = <Glyphicon icon='volume-up' />;
		 		}
		 		
		 		break;
		 	case 'text': 
		 		extra = <Glyphicon icon='font' />;
		 		break;
		 }

		return <div className='media-object-item-preview'>
			{extra}
			{this.props.children}
		</div>;
	}
});

module.exports = MediaObjectPreview;