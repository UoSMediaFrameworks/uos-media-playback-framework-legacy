'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var soundCloud = require('../../utils/sound-cloud');

var MediaObjectPreview = React.createClass({

	getInitialState: function() {
		return {
			waveformUrl: undefined 
		};
	},

	loadSoundCloudWaveform: function(url) {
		var mo = this.props.mediaObject;
		if (mo.type === 'audio' && ! this.state.waveformUrl) {
			soundCloud.getInfo(mo.url, function(info) {
				// triggers invariant violation sometimes
				this.setState({waveformUrl: info.waveform_url});
			}.bind(this));
		}
	},

	componentWillMount: function() {
		this.loadSoundCloudWaveform();
	},

	componentWillReceiveProps: function(nextProps) {
		this.loadSoundCloudWaveform();	
	},

	render: function() {
		var type = this.props.mediaObject.type,
			extra;
		 switch(type) {
		 	case 'image':
		 		extra = <img src={this.props.mediaObject.url} />;
		 		break;
		 	case 'video': 
		 		extra = <Glyphicon icon='facetime-video' />;
		 		break;
		 	case 'audio':
		 		if (this.state.waveformUrl) {
		 			extra = <img className='waveform-url' src={this.state.waveformUrl} />;	
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