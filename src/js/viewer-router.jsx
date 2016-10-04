'use strict';

//APEP: DEPCREATED - Not valid for new react version with update of version.

var React = require('react');
var Router = require('react-router');
var Route = Router.Route,
    RouteHandler = Router.RouteHandler,
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link;
var LoginPage = require('./pages/login-page.jsx');
var ViewerApp = require('./components/viewer-app.jsx');
var SceneListener = require('./pages/scene-listener.jsx');
var SceneSelector = require('./pages/viewer/scene-selector.jsx');


var routes = (
    <Route handler={ViewerApp}>
        <DefaultRoute handler={SceneSelector} />
        <Route name='login' handler={LoginPage} />
        <Route name='scenes' path='/scenes/?' handler={SceneSelector} />
        <Route name='scene' path='/scenes/:id' handler={SceneListener} />
    </Route>
);

var ViewerRouter = Router.create({routes: routes});

module.exports = ViewerRouter;
