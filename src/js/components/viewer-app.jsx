'use strict';
var React = require('react');

var Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;




var ViewerApp = React.createClass({

	render: function() {
		return <RouteHandler />;
	}

});

module.exports = ViewerApp;