'use strict';
var React = require('react');
var HubClient = require('../utils/HubClient');
var LoginPage = require('./login/login-page.jsx');
var SceneEditor = require('./scene-editor/scene-editor.jsx');
var ClientStore = require('../stores/client-store');

HubClient.login('http://127.0.0.1:3000', 'kittens');

function _getState () {
    return {loggedIn: ClientStore.loggedIn()};
}


var App = React.createClass({
    getInitialState: function() {
        return _getState();
    },
    componentDidMount: function() {
        ClientStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        ClientStore.removeChangeListener(this._onChange);
    },
    _onChange: function() {
        this.setState(_getState());
    },
    render: function() {
        return <SceneEditor />;
        return this.state.loggedIn ? <SceneEditor /> : <LoginPage />; 
    }

});

module.exports = App;
