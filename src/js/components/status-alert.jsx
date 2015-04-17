var React = require('react');

var StatusAlert = React.createClass({

	render: function() {
		var klass = 'alert alert-' + this.props.state.state;
		return (
			<div className={klass}>
				{this.props.state.message}
			</div>
		);
	}

});

module.exports = StatusAlert;