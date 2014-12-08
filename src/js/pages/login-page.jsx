'use strict';

var React = require('react');
var HubSendActions = require('../actions/hub-send-actions');
var ClientStore = require('../stores/client-store');
var FormHelper = require('../mixins/form-helper');
var Router = require('react-router');

function _getState () {
    return {
        loggedIn: ClientStore.loggedIn(),
        error: ClientStore.failedAttempt()
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
		HubSendActions.tryLogin(this.getRefVal('url'), {password: this.getRefVal('password')});
	},

	render: function() {
        var klass = 'form-group';
        var alert;

        if (this.state.error) {
            klass += ' has-error';    
            alert = <div className='alert alert-danger'>Invalid URL or Password</div>;
        }
        

		return (
			<div className="row">
				<div className="col-sm-6 col-sm-offset-3">
					<h1>Please Login</h1>
                    {alert}
					<form onSubmit={this.handleSubmit} role="form">
						<div className={klass}>
						    <label>Url</label>
						    <input ref="url" type="text" className="form-control" id="exampleInputEmail1" placeholder="Hub Url" />
						  </div>

						<div className={klass}>
		    				<label>Password</label>
		    				<input ref="password" type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
		  				</div>

		  				<div className={klass}>
		  					<button type="submit" className="btn btn-primary">Login</button>
		  				</div>
		  				
					</form>
				</div>
			</div>
		);
	}
});

module.exports = LoginPage;