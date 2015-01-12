'use strict';
var React = require('react');
var LoginPage = require('../pages/login-page.jsx');
var ClientStore = require('../stores/client-store');
var SceneActions = require('../actions/scene-actions');
var Loader = require('react-loader');
var Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;


function _getState () {
    return {
        loggedIn: ClientStore.loggedIn(),
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

        return (
            <div className='app'>
                <div className='header'>
                    {sessionNav}                      
                    <h4 className='title'>Media Scene Editor</h4>
                </div>
                <Loader loaded={! this.state.attemptingLogin}>
                    <RouteHandler key='handler' />
                </Loader>
            </div>
        );       

        
    }

});

module.exports = App;
