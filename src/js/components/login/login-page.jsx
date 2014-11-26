'use strict';

var React = require('react');
var HubSendActions = require('../../actions/hub-send-actions');
var ClientStore = require('../../stores/client-store');

function _getState () {
    return {loggedIn: ClientStore.loggedIn()};
}


var LoginPage = React.createClass({
	propTypes: {
		element: React.PropTypes.element
	},

	getInitialState: function() {
        return _getState();
    },

    componentDidMount: function() {
        ClientStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ClientStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(_getState());
    },

	getRefVal: function(name) {
		return this.refs[name].getDOMNode().value;
	},

	handleSubmit: function(e) {
		e.preventDefault();
		HubSendActions.tryLogin(this.getRefVal('url'), this.getRefVal('password'));
	},

	render: function() {
		if( this.state.loggedIn ) {
			return this.props.element;
		} else {
			return (
				<div className="row">
					<div className="col-sm-6 col-sm-offset-3">
						<h1>{this.props.header}</h1>
						<form onSubmit={this.handleSubmit} role="form">
							<div className="form-group">
							    <label>Url</label>
							    <input ref="url" type="text" className="form-control" id="exampleInputEmail1" placeholder="Hub Url" />
							  </div>

							<div className="form-group">
			    				<label>Password</label>
			    				<input ref="password" type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
			  				</div>

			  				<div className="form-group">
			  					<button type="submit" className="btn btn-primary">Login</button>
			  				</div>
			  				
						</form>
					</div>
				</div>
			);
		}
	}
});

module.exports = LoginPage;