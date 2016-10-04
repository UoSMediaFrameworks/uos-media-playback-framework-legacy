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
var ViewerApp = require('./components/viewer-app.jsx');
var SceneListener = require('./pages/scene-listener.jsx');
var SceneSelector = require('./pages/viewer/scene-selector.jsx');

HubSendActions.tryTokenLogin();

ReactDOM.render((<Router history={hashHistory}>
    <Route path="/" component={ViewerApp}>
        <IndexRoute component={SceneSelector} />
        <Route name='login'  path='login/?' component={LoginPage} />
        <Route name='scenes' path='scenes' component={SceneSelector} />
        <Route name='scene'  path='scene/:id' component={SceneListener} />
    </Route>
</Router>), document.getElementById('main'));

