'use strict';
/*jshint browser: true */

var React = require('react');
var Router = require('./app-router.jsx');
var HubSendActions = require('./actions/hub-send-actions');
var connectionCache = require('./utils/connection-cache');

// login with localStorage creds if possible
HubSendActions.tryTokenLogin();

Router.run(function(Handler) {
    React.render(<Handler />, document.getElementById('main'));
});
