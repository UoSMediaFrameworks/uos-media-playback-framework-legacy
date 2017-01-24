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
var appVersion = require('../utils/app-version');

function _getState() {
    return {
        loggedIn: ClientStore.loggedIn(),
        attemptingLogin: ClientStore.attemptingLogin(),
        messages: StatusMessageStore.getMessages(),
        versionData: appVersion.getVersion()
    }
}

var production = process.env.NODE_ENV === 'production';

var App = React.createClass({

    getInitialState: function () {
        return _getState();
    },

    componentDidMount: function () {
        ClientStore.addChangeListener(this._onChange);
        StatusMessageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        ClientStore.removeChangeListener(this._onChange);
        StatusMessageStore.removeChangeListener(this._onChange);
    },

    _onChange: function () {
        this.setState(_getState());
    },

    handleLogout: function (event) {
        SceneActions.logout();
    },

    render: function () {
        var sessionNav, nav;
        var versionText = this.state.versionData && this.state.versionData.sha ? this.state.versionData.sha.substring(0, 7) : "loading..";

        var banner = !production ? <span className="navbar-text"> - DEV BUILD </span> : <span></span>;

        //AJF: gets the groupID then passes as a parameter to get the group name. I tried a version of getShortGroupName that would accept no groupID and get it from the current session but it wasn't working @todo: fix this in connectioncache
        if (this.state.loggedIn) {
            sessionNav = <ul className="nav navbar-nav navbar-right">
                <li><a href="/#/scenegraphs" className="navbar-link"
                       target="_blank">Open SceneGraph Creator</a></li>
                <li><a target='_blank' className='navbar-link'
                       href='https://docs.google.com/document/d/1B25gvDRob576KPsgusEhhUY3GI_XF6guHIBpLPrn9U0/edit?usp=sharing'>
                    Do's &amp; Don'ts of Media Frameworks
                </a></li>

                <li>
                    <span className="navbar-text">Version: {versionText}</span>
                    {banner}
                </li>
                <li>

                    <p className="navbar-text">{connectionCache.getGroupID()}
                        - {connectionCache.getShortGroupName(connectionCache.getGroupID())}</p>

                </li>
                <li>
                <button type="button" className='btn btn-dark navbar-btn' onClick={this.handleLogout}>Log out
                </button>
                </li>
            </ul>;

        } else {

            sessionNav = <ul className="nav navbar-nav navbar-right">
                <li>
                    <a target='_blank' className='navbar-link'
                       href='https://docs.google.com/document/d/1B25gvDRob576KPsgusEhhUY3GI_XF6guHIBpLPrn9U0/edit?usp=sharing'>
                        Do's &amp; Don'ts of Media Frameworks
                    </a>
                </li>
                <li className="button">
                    <span className="navbar-text">Version: {versionText}</span>
                    {banner}
                </li>

            </ul>;
        }

        var messages = this.state.messages;

        var statusAlerts = Object.keys(messages).map(function (name) {
            return <StatusAlert key={name} name={name} state={messages[name]}/>;
        });

        return (
            <div className='app'>
                <div className="status-messages">
                    {statusAlerts}
                </div>
                <nav className='navbar navbar-inverse'>
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand" href="#">Media Scene Editor</a>
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                    data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                        </div>
                        <div className="collapse navbar-collapse">
                            {sessionNav}
                        </div>
                    </div>
                </nav>
                <Loader message='Logging in...' loaded={!this.state.attemptingLogin}>
                    {this.props.children}
                </Loader>

            </div>
        );


    }

});

module.exports = App;
