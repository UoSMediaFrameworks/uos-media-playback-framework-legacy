'use strict';
/*jshint browser: true */

var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var IndexRoute = require('react-router').IndexRoute;
var hashHistory = require('react-router').hashHistory;
var HubSendActions = require('./actions/hub-send-actions');
var GridLayoutApp = require('./components/grid-layout-app.jsx');
var PresentationLayoutApp = require('./pages/presentation-layout-app.jsx');
var LoginPage = require('./pages/login-page.jsx');
var ClientStore = require('./stores/client-store');
var appVersion = require('./utils/app-version');
var AdjustableGrid = require('./pages/adjustable-grid.jsx');
var PopOutComponent = require('./pages/pop-out-component.jsx');
// login with localStorage creds if possible
HubSendActions.tryTokenLogin();

// precache version data
appVersion.getVersion();

function requireAuth(nextState, replaceState) {
    if (!ClientStore.loggedIn())
        replaceState({ nextPathname: nextState.location.pathname }, '/login' + nextState.location.search)
}

ReactDOM.render(
    (<Router history={hashHistory}>
        <Route path="/" component={GridLayoutApp}>
            <IndexRoute component={AdjustableGrid} onEnter={requireAuth}/>
            <Route name="login" path="login" component={LoginPage}></Route>
            <Route name="pop-out-component" path="pop-out-component" component={PopOutComponent} onEnter={requireAuth}/>
        </Route>
        <Route path="/presentation" component={PresentationLayoutApp}>
            <IndexRoute component={PopOutComponent} onEnter={requireAuth}/>
        </Route>
    </Router> ), document.getElementById('main')
   );

