var React = require('react');

var FileUpload = React.createClass({

	render: function() {
		return (
			<div className='alert alert-info'>
				{this.props.name} {this.props.state}
			</div>
		);
	}

});

module.exports = FileUpload;