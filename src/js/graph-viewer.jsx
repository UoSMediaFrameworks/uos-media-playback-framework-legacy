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
var ClientStore = require('./stores/client-store');

var GraphViewerApp = require('./components/graph-viewer-app.jsx');
var GraphViewer = require('./pages/viewer/graph-viewer.jsx');

// APEP prototyping components
var Grid = require('./components/pages/grid.jsx');
var AdjustableGrid = require('./components/pages/adjustable-grid.jsx');
var ResponsiveGrid = require('./components/pages/responsive-grid.jsx');
var PictureInPicture = require('./components/pages/picture-in-picture.jsx');

HubSendActions.tryTokenLogin();

function requireAuth(nextState, replaceState) {
  /*  console.log("client",ClientStore.loggedIn())*/
    if (!ClientStore.loggedIn()) {
        replaceState({ nextPathname: nextState.location.pathname }, '/login' + nextState.location.search)
    }
}

ReactDOM.render((<Router history={hashHistory}>
    <Route path="/" component={GraphViewerApp}>
        <IndexRoute component={GraphViewer} onEnter={requireAuth}/>
        <Route name='picture-in-picture' path='picture-in-picture' component={PictureInPicture} onEnter={requireAuth}/>
        <Route name='grid-layout' path='grid' component={Grid} onEnter={requireAuth}/>
        <Route name='agrid-layout' path='agrid' component={AdjustableGrid} onEnter={requireAuth}/>
        <Route name='r-grid-layout' path='r-grid' component={ResponsiveGrid} onEnter={requireAuth}/>
        <Route name='login'  path='login' component={LoginPage} />
    </Route>
</Router>), document.getElementById('main'));

