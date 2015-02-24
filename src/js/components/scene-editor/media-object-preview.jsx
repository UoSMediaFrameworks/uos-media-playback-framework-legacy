'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');

var MediaObjectPreview = React.createClass({

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