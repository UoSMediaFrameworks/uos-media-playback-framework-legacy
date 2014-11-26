'use strict';
var React = require('react');
var SceneList = require('../scene-editor/scene-list.jsx');
var HubSendActions = require('../../actions/hub-send-actions');

var SceneSelector = React.createClass({
	handleSceneChange: function(sceneId) {
		HubSendActions.subscribeScene(sceneId);
	},
	render: function() {
		return (
			<SceneList onChange={this.handleSceneChange} />
		);
	}

});

module.exports = SceneSelector;