'use strict';
var React = require('react');
var Router = require('react-router');
var IndexApp = require('./components/index-app.jsx');
var SceneChooser = require('./components/pages/scene-choose-or-create.jsx');
var LoginPage = require('./components/login/login-page.jsx');
var Scene = require('./components/pages/scene.jsx');
var Route = Router.Route,
    RouteHandler = Router.RouteHandler,
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link;


var routes = (
    <Route handler={IndexApp}>
        <DefaultRoute handler={SceneChooser} />
        <Route name='login' handler={LoginPage} />
        <Route name='scenes' path='/scenes' handler={SceneChooser} />
        <Route name='scene' path='/scenes/:id' handler={Scene} />
    </Route>
);

var AppRouter = Router.create({
	routes: routes
});

module.exports = AppRouter;