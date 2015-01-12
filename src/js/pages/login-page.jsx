'use strict';

var React = require('react');
var HubSendActions = require('../actions/hub-send-actions');
var ClientStore = require('../stores/client-store');
var FormHelper = require('../mixins/form-helper');
var Router = require('react-router');


function _getState () {
    return {
        loggedIn: ClientStore.loggedIn(),
        attemptingLogin: ClientStore.attemptingLogin(),
        errorMessage: ClientStore.errorMessage()
    };
}


var LoginPage = React.createClass({
    mixins: [Router.Navigation, FormHelper],

    statics: {
        attemptedTransition: null
    },

	getInitialState: function() {
        return _getState();
    },

    redirectIfLoggedIn: function() {
        if (this.state.loggedIn) {
            if (LoginPage.attemptedTransition) {
               var trans = LoginPage.attemptedTransition;
                LoginPage.attemptedTransition = null;
                trans.retry();
            } else {
                this.transitionTo('/scenes');
            }
        }
    },

    componentDidMount: function() {
        ClientStore.addChangeListener(this._onChange);
        this.redirectIfLoggedIn();
    },

    componentWillUnmount: function() {
        ClientStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(_getState());

        this.redirectIfLoggedIn();
    },

	handleSubmit: function(e) {
		e.preventDefault();
		HubSendActions.tryLogin({password: this.getRefVal('password')});
	},

	render: function() {
        var alert;

        if (this.state.errorMessage) {
            alert = <div className='alert alert-danger'>{this.state.errorMessage}</div>;
        }
        

		return (
			<div className="row">
				<div className="col-sm-6 col-sm-offset-3">
					<h1>Please Login</h1>
                    {alert}
					<form onSubmit={this.handleSubmit} role="form">
						<div className='form-group'>
		    				<label>Password</label>
		    				<input ref="password" type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
		  				</div>

		  				<div className='form-group'>
                            <button type="submit" className="btn btn-primary">Login</button>
		  				</div>
		  				
					</form>
				</div>
			</div>
		);
	}
});

module.exports = LoginPage;