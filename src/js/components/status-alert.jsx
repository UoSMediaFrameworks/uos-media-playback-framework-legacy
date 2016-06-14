var React = require('react');
var SceneActions = require('../actions/scene-actions');

var StatusAlert = React.createClass({

    handleStatusClick: function(alertId) {
        SceneActions.dismissStatus(alertId);
    },

	render: function() {
		var klass = 'alert alert-' + this.props.state.state;
		return (
			<div className={klass} onClick={() => this.handleStatusClick(this.props.state.id)}>
				{this.props.state.message}

                <span className="glyphicon glyphicon-remove"></span>
			</div>
		);
	}

});

module.exports = StatusAlert;
