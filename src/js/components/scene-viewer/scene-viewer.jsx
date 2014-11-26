'use strict';
var React = require('react');
var ScenePlayer = require('../scene-player.jsx');
var SceneSelector = require('./scene-selector.jsx');
var SceneViewer = React.createClass({

	render: function() {
		return (
			<div>
				<SceneSelector />
				<ScenePlayer />
			</div>
			
		);
	}

});

module.exports = SceneViewer;