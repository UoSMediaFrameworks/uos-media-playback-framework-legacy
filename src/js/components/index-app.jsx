'use strict';
var React = require('react');
var LoginPage = require('../pages/login-page.jsx');
var ClientStore = require('../stores/client-store');
var SceneActions = require('../actions/scene-actions');
var NavLink = require('./nav-link.jsx');
var Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;


function _getState () {
    return {
        loggedIn: ClientStore.loggedIn(),
        error: ClientStore.failedAttempt(),
        attemptingLogin: ClientStore.attemptingLogin()
    };
}

var App = React.createClass({
    
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

    handleLogout: function(event) {
        SceneActions.logout();
    },
    
    render: function() {
        var nav;

        if (this.state.loggedIn) {
            nav = <ul role='navigation' className='nav nav-pills page-nav'>
                <NavLink to='scenes'>Scene List</NavLink>
                <li><a onClick={this.handleLogout}>Log out</a></li>
            </ul>;
        }

        if (this.state.attemptingLogin) {
            return <h1>Logging in...</h1>;
        } else {

            return (
                <div className='container'>
                    <div key='row' className='row'>
                        <div className='col-md-12'>
                            <h1>Media Scene Editor</h1>
                            {nav}       
                        </div>
                    </div>
                    <RouteHandler key='handler' />
                </div>
            );    
        }   

        
    }

});

module.exports = App;
