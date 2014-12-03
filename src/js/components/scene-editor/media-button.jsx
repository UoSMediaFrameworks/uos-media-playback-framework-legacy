'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');

var MediaButton = React.createClass({

	handleClick: function(event) {
		this.props.onClick(this.props.val);
	},

	render: function() {
		var btnClass = 'btn btn-default' + (this.props.switch === this.props.val ? ' btn-selected' : '');

		return (
			<button type='button' onClick={this.handleClick} className={btnClass}>
				<Glyphicon icon={this.props.glyphicon} />
			</button>
		);
	}

});

module.exports = MediaButton;