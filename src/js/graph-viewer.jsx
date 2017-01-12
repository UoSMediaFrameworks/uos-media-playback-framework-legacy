'use strict';
/*jshint browser: true */

var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var IndexRoute = require('react-router').IndexRoute;
var hashHistory = require('react-router').hashHistory;
var HubSendActions = require('./actions/hub-send-actions');

var LoginPage = require('./pages/login-page.jsx');

// TODO Generic app container suits this app too
var GraphViewerApp = require('./components/graph-viewer-app.jsx');
var GraphViewer = require('./pages/viewer/graph-viewer.jsx');

HubSendActions.tryTokenLogin();

ReactDOM.render((<Router history={hashHistory}>
    <Route path="/" component={GraphViewerApp}>
        <IndexRoute component={GraphViewer} />
        <Route name='login'  path='login' component={LoginPage} />
    </Route>
</Router>), document.getElementById('main'));

