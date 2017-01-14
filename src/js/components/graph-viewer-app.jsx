'use strict';
var React = require('react');
var Loader = require('./loader.jsx');
var ClientStore = require('../stores/client-store');
var Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;
var HubClient = require('../utils/HubClient');

function _getState () {
    return {
        loggedIn: ClientStore.loggedIn(),
        attemptingLogin: ClientStore.attemptingLogin()
    };
}


var ViewerApp = React.createClass({

    getInitialState: function() {
        return _getState();
    },

    componentDidMount: function() {
        ClientStore.addChangeListener(this._onChange);

        var roomId = this.props.location.query.room;

        HubClient.registerToGraphPlayerRoom(roomId);
    },

    componentWillUnmount: function() {
        ClientStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(_getState());
    },


    render: function() {
        return (
            <Loader className='login-loader' message='Logging in...' loaded={! this.state.attemptingLogin}>
                {this.props.children}
            </Loader>
        );
    }

});

module.exports = ViewerApp;
