'use strict';

var React = require('react');
var HubSendActions = require('../actions/hub-send-actions');
var ClientStore = require('../stores/client-store');
var FormHelper = require('../mixins/form-helper');
var Router = require('react-router');
var hashHistory = require('react-router').hashHistory;

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
            //React Rotuer 2.X logic to provide redirection to nextPathName if exists
            //NextPathName exists if the requiredAuth check fails (due to async nature of our login system) but does have a forwarding path available
            var location = this.props.location;
            if (location.state && location.state.nextPathname) {
                hashHistory.push(location.state.nextPathname + location.search);
            } else {
                hashHistory.push('/')
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
		HubSendActions.tryLogin({username: this.getRefVal('username'), password: this.getRefVal('password')});
	},

	render: function() {
        var alert;

        if (this.state.errorMessage) {
            alert = <div className='alert alert-danger'>{this.state.errorMessage}</div>;
        }


		return (
            <div>
                <div className="row">
                <div className="col-sm-6 col-sm-offset-3">
                    <h1>Please Login</h1>
                    {alert}
                    <form onSubmit={this.handleSubmit} role="form">
                        <div className='form-group'>
                            <label>Username</label>
                            <input ref="username" type="text" className="form-control" id="exampleInputUsername1" placeholder="Username" />
                        </div>
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

                <div className="footer navbar-fixed-bottom" style={{ padding: '5px', zIndex: "-1" }}>
                    <a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons Licence" style={{ borderWidth:0 }} src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
                </div>

            </div>

		);
	}
});

module.exports = LoginPage;
