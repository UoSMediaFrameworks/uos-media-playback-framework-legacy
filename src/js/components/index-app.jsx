'use strict';
var React = require('react');
var LoginPage = require('../pages/login-page.jsx');
var ClientStore = require('../stores/client-store');
var SceneActions = require('../actions/scene-actions');
var Loader = require('./loader.jsx');
var StatusMessageStore = require('../stores/status-message-store');
var StatusAlert = require('./status-alert.jsx');
var Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;
var connectionCache = require('../utils/connection-cache');

function _getState () {
    return {
        loggedIn: ClientStore.loggedIn(),
        attemptingLogin: ClientStore.attemptingLogin(),
        messages: StatusMessageStore.getMessages()
    };
}

var App = React.createClass({

    getInitialState: function() {
        return _getState();
    },

    componentDidMount: function() {
        ClientStore.addChangeListener(this._onChange);
        StatusMessageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ClientStore.removeChangeListener(this._onChange);
        StatusMessageStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(_getState());
    },

    handleLogout: function(event) {
        SceneActions.logout();
    },

    render: function() {
        var sessionNav, nav;
		//AJF: gets the groupID then passes as a parameter to get the group name. I tried a version of getShortGroupName that would accept no groupID and get it from the current session but it wasn't working @todo: fix this in connectioncache
        if (this.state.loggedIn) {
            sessionNav = <div className='session-nav'><span>{connectionCache.getGroupID()} - {connectionCache.getShortGroupName(connectionCache.getGroupID())}</span>
                <a className='btn' onClick={this.handleLogout}>Log out</a>
            </div>;
        }

        var messages = this.state.messages;

        var statusAlerts = Object.keys(messages).map(function(name) {
            return <StatusAlert key={name} name={name} state={messages[name]} />;
        });

        return (
            <div className='app'>
                <div className="status-messages">
                    {statusAlerts}
                </div>
                <div className='header'>
                    {sessionNav}
                    <a target='_blank' className='dos-donts' href='https://docs.google.com/document/d/1B25gvDRob576KPsgusEhhUY3GI_XF6guHIBpLPrn9U0/edit?usp=sharing'>
                        Do's &amp; Don'ts of Media Frameworks
                    </a>
                    <h4 className='title'>Media Scene Editor</h4>

                </div>
                <Loader message='Logging in...' loaded={! this.state.attemptingLogin}>
                    <RouteHandler key='handler' />
                </Loader>

                <div className="footer navbar-fixed-bottom" style={{ padding: '5px' }}>
                    <a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons Licence" style={{ borderWidth:0 }} src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
                </div>

            </div>
        );


    }

});

module.exports = App;
