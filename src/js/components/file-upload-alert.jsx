var React = require('react');

var FileUpload = React.createClass({

	render: function() {
		var klass = 'alert alert-' + this.props.state.state;
		return (
			<div className={klass}>
				{this.props.name} {this.props.state.message || this.props.state}
			</div>
		);
	}

});

module.exports = FileUpload;