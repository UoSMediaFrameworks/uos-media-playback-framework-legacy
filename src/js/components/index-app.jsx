'use strict';
var React = require('react');
var HubClient = require('../utils/HubClient');
var LoginPage = require('./login/login-page.jsx');
var SceneEditor = require('./scene-editor/scene-editor.jsx');

//HubClient.login('http://127.0.0.1:3000', 'kittens');

var App = React.createClass({
    
    render: function() {
        return  <LoginPage header='Media Scene Editor' element={<SceneEditor />} />; 
    }

});

module.exports = App;
