'use strict';
var React = require('react');
var LoginPage = require('./login/login-page.jsx');
var SceneViewer = require('./scene-viewer/scene-viewer.jsx');
var HubClient = require('../utils/HubClient');

//HubClient.login('http://127.0.0.1:3000', 'kittens');

var ViewerApp = React.createClass({

	render: function() {
		return <LoginPage header='Media Scene Viewer' element={<SceneViewer />} />;
	}

});

module.exports = ViewerApp;