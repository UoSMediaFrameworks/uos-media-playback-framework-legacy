'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');

var MediaObjectPreview = React.createClass({

	render: function() {
		var type = this.props.mediaObject.type;
		
		if (type === 'image') {
			return <img src={this.props.mediaObject.url} className='media-object-preview' />;
		} else {
			return <Glyphicon icon={type} />;
		}
	}
});

module.exports = MediaObjectPreview;