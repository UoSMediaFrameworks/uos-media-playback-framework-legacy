'use strict';
var React = require('react');
var HubClient = require('../utils/HubClient');
var LoginPage = require('./login/login-page.jsx');
var SceneEditor = require('./scene-editor/scene-editor.jsx');
var ClientStore = require('../stores/client-store');
var SceneActions = require('../actions/scene-actions');
var Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;


function _getState () {
    return {
        loggedIn: ClientStore.loggedIn(),
        error: ClientStore.failedAttempt()
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

        if (this.state.loggedIn) {
            if (LoginPage.attemptedTransition) {
               var trans = LoginPage.attemptedTransition;
                LoginPage.attemptedTransition = null;
                trans.retry();
            } else {
                this.replaceWith('/scenes');
            }
        }
        
    },

    handleLogout: function(event) {
        SceneActions.logout();
    },
    
    render: function() {
        var logout = this.state.loggedIn ? <button onClick={this.handleLogout} className='btn btn-link'>Log out</button> : null;

        //return  <LoginPage header='Media Scene Editor' element={<SceneEditor />} />; 

        return (
            <div>
                <h1>Media Scene Editor</h1>
                {logout}
                <RouteHandler />
            </div>
        );
    }

});

module.exports = App;
