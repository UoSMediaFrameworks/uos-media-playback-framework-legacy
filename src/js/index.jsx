'use strict';
/*jshint browser: true */

var React = require('react');
var ReactDOM = require('react-dom');

var Routing = require('react-router');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var IndexRoute = require('react-router').IndexRoute;
var hashHistory = require('react-router').hashHistory;
var Link = require('react-router').Link;

var HubSendActions = require('./actions/hub-send-actions');
var connectionCache = require('./utils/connection-cache');

var IndexApp = require('./components/index-app.jsx');
var SceneChooser = require('./components/pages/scene-choose-or-create.jsx');
var SceneGraphChooser = require('./components/pages/scene-graph-choose-or-create.jsx');
var LoginPage = require('./pages/login-page.jsx');
var Scene = require('./components/pages/scene.jsx');
var SceneGraph = require('./components/pages/scenegraph.jsx');


// login with localStorage creds if possible
HubSendActions.tryTokenLogin();

ReactDOM.render((<Router history={hashHistory}>
    <Route path='/' component={IndexApp} >
        <IndexRoute component={SceneChooser} />
        <Route name='login'        path='login/?' component={LoginPage} />
        <Route name='scenes'       path='scenes' component={SceneChooser} />
        <Route name='scene'        path="scene/:id" component={Scene} />
        <Route name='scenegraphs'  path='scenegraphs' component={SceneGraphChooser} />
        <Route name='scenegraph'   path='scenegraph/:id' component={SceneGraph} />
    </Route>
</Router>), document.getElementById('main'));

