'use strict';

var React = require('react');
var Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;

var NavLink = React.createClass({
	mixins: [Router.State],

	render: function() {
		var klass = this.isActive(this.props.to) ? 'active' : '';

		return (
			<li className={klass}><Link to={this.props.to}>{this.props.children}</Link></li>
		);
	}

});

module.exports = NavLink;