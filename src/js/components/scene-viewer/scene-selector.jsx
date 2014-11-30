'use strict';
var React = require('react');
var SceneList = require('../scene-editor/scene-list.jsx');
var HubSendActions = require('../../actions/hub-send-actions');

var curSceneId;

var SceneSelector = React.createClass({
	handleSceneChange: function(sceneId) {
        if ( curSceneId ) {
            HubSendActions.unsubscribeScene(curSceneId);
        }
        
        curSceneId = sceneId;
		HubSendActions.subscribeScene(curSceneId);
	},
	render: function() {
		return (
			<SceneList onChange={this.handleSceneChange} />
		);
	}

});

module.exports = SceneSelector;