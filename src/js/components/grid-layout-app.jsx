'use strict';
var React = require('react');
var ClientStore = require('../stores/client-store');
var Loader = require('./loader.jsx');
var StatusMessageStore = require('../stores/status-message-store');
var StatusAlert = require('./status-alert.jsx');
var appVersion = require('../utils/app-version');

var NavBar = require('../components/navigation-bar.jsx');

function _getState() {
    return {
        loggedIn: ClientStore.loggedIn(),
        attemptingLogin: ClientStore.attemptingLogin(),
        messages: StatusMessageStore.getMessages(),
        versionData: appVersion.getVersion()
    }
}
var production = process.env.NODE_ENV === 'production';

var LayoutApp = React.createClass({
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
    render: function () {

        var messages = this.state.messages;

        var statusAlerts = Object.keys(messages).map(function (name) {
            return <StatusAlert key={name} name={name} state={messages[name]}/>;
        });
        return (<div className='app'>
            <NavBar/>
            <div className="status-messages">
                {statusAlerts}
            </div>

            <Loader message='Logging in...' loaded={!this.state.attemptingLogin}>
                {this.props.children}
            </Loader>


        </div>);

    }
});

module.exports = LayoutApp;
