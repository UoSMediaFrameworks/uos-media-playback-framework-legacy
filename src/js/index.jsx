'use strict';
/*jshint browser: true */

var App = require('./components/index-app.jsx');
var React = require('react');
var Router = require('react-router');
var LoginPage = require('./components/login/login-page.jsx');
var SceneEditor = require('./components/scene-editor/scene-editor.jsx');
var SceneList = require('./components/pages/scene-list.jsx');
var HubClient = require('./utils/HubClient');
var Route = Router.Route,
    RouteHandler = Router.RouteHandler,
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link;

HubClient.login();

var routes = (
    <Route handler={App}>
        <DefaultRoute handler={SceneList} />
        <Route name='login' handler={LoginPage} />
        <Route name='scenes' path='/scenes' handler={SceneList} />
        <Route name='scene' path='/scenes/:id' handler={SceneEditor} />
    </Route>
);

Router.run(routes, function(Handler) {
    React.render(<Handler />, document.getElementById('main'));
});
