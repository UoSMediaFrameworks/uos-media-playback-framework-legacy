var React = require('react');

var Glyphicon = React.createClass({

	render: function() {
		var spanClass = 'glyphicon glyphicon-' + this.props.icon;
		return (
			<span className={spanClass}></span>
		);
	}

});

module.exports = Glyphicon;