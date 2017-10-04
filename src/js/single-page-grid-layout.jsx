'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var IndexRoute = require('react-router').IndexRoute;
var hashHistory = require('react-router').hashHistory;

var GridLayoutApp = require('./components/grid-layout-app.jsx');
var HubSendActions = require('./actions/hub-send-actions');
var AdjustableGrid = require('./components/pages/adjustable-grid.jsx');
var ClientStore = require('./stores/client-store');
var appVersion = require('./utils/app-version');
var LoginPage = require('./pages/login-page.jsx');

//This is not working properly at the moment
HubSendActions.tryTokenLogin();

appVersion.getVersion();

function requireAuth(nextState, replaceState) {
    if (!ClientStore.loggedIn())
        replaceState({nextPathname: nextState.location.pathname}, '/login' + nextState.location.search)
}

ReactDOM.render(
    (
        <Router history={hashHistory}>
            <Route path="/" component={GridLayoutApp}>
                <IndexRoute component={AdjustableGrid} onEnter={requireAuth}/>
                <Route name="login" path="login" components={LoginPage}></Route>
            </Route>
        </Router>
    ), document.getElementById('main')
);
