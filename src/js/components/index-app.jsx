'use strict';
var React = require('react');
var LoginPage = require('../pages/login-page.jsx');
var ClientStore = require('../stores/client-store');
var SceneActions = require('../actions/scene-actions');
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
        var sessionNav, nav;

        if (this.state.loggedIn) {
            sessionNav = <div className='session-nav'>
                <a className='btn' onClick={this.handleLogout}>Log out</a>
            </div>;
        }

        if (this.state.attemptingLogin) {
            return <h1 className='logging-in-message'>Logging in...</h1>;
        } else {

            return (
                <div className='app'>
                    <div className='header'>
                        {sessionNav}                      
                        <h4 className='title'>Media Scene Editor</h4>
                    </div>
                    <RouteHandler key='handler' />
                </div>
            );    
        }   

        
    }

});

module.exports = App;
