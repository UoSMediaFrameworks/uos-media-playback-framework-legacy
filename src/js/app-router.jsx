'use strict';
var React = require('react');
var Router = require('react-router');
var IndexApp = require('./components/index-app.jsx');
var SceneChooser = require('./components/pages/scene-choose-or-create.jsx');
var SceneGraphChooser = require('./components/pages/scene-graph-choose-or-create.jsx');
var LoginPage = require('./pages/login-page.jsx');
var Scene = require('./components/pages/scene.jsx');
var SceneGraph = require('./components/pages/scenegraph.jsx');
var Route = Router.Route,
    RouteHandler = Router.RouteHandler,
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link;


var routes = (
    <Route handler={IndexApp}>
        <DefaultRoute handler={SceneChooser} />
        <Route name='login' path='/login/?' handler={LoginPage} />
        <Route name='scenes' path='/scenes/?' handler={SceneChooser} />
        <Route name='scene' path='/scenes/:id' handler={Scene} />
        <Route name='scenegraphs' path='/scenegraphs/?' handler={SceneGraphChooser} />
        <Route name='scenegraph' path='/scenegraph/:id' handler={SceneGraph} />
    </Route>
);

var AppRouter = Router.create({
	routes: routes
});

module.exports = AppRouter;
