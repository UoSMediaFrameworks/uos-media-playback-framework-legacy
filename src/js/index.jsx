'use strict';
/*jshint browser: true */

var React = require('react');
var ReactDOM = require('react-dom');
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
var ContactPage = require('./pages/contact-page.jsx');
var Scene = require('./components/pages/scene.jsx');
var SceneGraph = require('./components/pages/scenegraph.jsx');
var Score = require('./components/pages/score.jsx');

var ClientStore = require('./stores/client-store');
var appVersion = require('./utils/app-version');

// login with localStorage creds if possible
HubSendActions.tryTokenLogin();

// precache version data
appVersion.getVersion();

function requireAuth(nextState, replaceState) {
    if (!ClientStore.loggedIn())
        replaceState({ nextPathname: nextState.location.pathname }, '/login')
}

ReactDOM.render((<Router history={hashHistory}>
    <Route path='/' component={IndexApp} >
        <IndexRoute component={SceneChooser} onEnter={requireAuth}/>
        <Route name='login'        path='login' component={LoginPage} />
        <Route name='contact'      path='contact' component={ContactPage} />
        <Route name='scenes'       path='scenes' component={SceneChooser} onEnter={requireAuth}/>
        <Route name='scene'        path="scene/:id" component={Scene} onEnter={requireAuth}/>
        <Route name='scenegraphs'  path='scenegraphs' component={SceneGraphChooser} onEnter={requireAuth}/>
        <Route name='scenegraph'   path='scenegraph/:id' component={SceneGraph} onEnter={requireAuth}/>
        <Route name='score'        path='score' component={Score} onEnter={requireAuth}/>
    </Route>
</Router>), document.getElementById('main'));

