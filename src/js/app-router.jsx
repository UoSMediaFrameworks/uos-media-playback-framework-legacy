'use strict';
var React = require('react');
var Router = require('react-router');
var IndexApp = require('./components/index-app.jsx');
var SceneList = require('./components/pages/scene-list.jsx');
var LoginPage = require('./components/login/login-page.jsx');
var Scene = require('./components/pages/scene.jsx');
var Route = Router.Route,
    RouteHandler = Router.RouteHandler,
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link;


var routes = (
    <Route handler={IndexApp}>
        <DefaultRoute handler={SceneList} />
        <Route name='login' handler={LoginPage} />
        <Route name='scenes' path='/scenes' handler={SceneList} />
        <Route name='scene' path='/scenes/:id' handler={Scene} />
    </Route>
);

var AppRouter = Router.create({
	routes: routes
});

module.exports = AppRouter;