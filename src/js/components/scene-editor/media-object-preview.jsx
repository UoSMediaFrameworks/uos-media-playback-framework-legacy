'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');

var MediaObjectPreview = React.createClass({

	render: function() {
		var type = this.props.mediaObject.type,
			style, extra;
		 switch(type) {
		 	case 'image':
		 		style = {
		 		    backgroundImage: 'url(\'' + this.props.mediaObject.url + '\')' 
		 		};
		 		break;
		 	case 'video': 
		 		extra = <Glyphicon icon='facetime-video' />;
		 		break;
		 	case 'text': 
		 		extra = <Glyphicon icon='font' />;
		 		break;
		 }

		return <div className='media-object-item-preview' style={style}>
			{extra}
			{this.props.children}
		</div>;
	}
});

module.exports = MediaObjectPreview;