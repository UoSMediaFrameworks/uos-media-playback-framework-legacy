'use strict';
/*jshint browser: true */

var React = require('react');
var Router = require('./viewer-router.jsx');
var HubSendActions = require('./actions/hub-send-actions');

HubSendActions.tryTokenLogin();

Router.run(function(Handler) {
    React.render(<Handler />, document.getElementById('main'));
});