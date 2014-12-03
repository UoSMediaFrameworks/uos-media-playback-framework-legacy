'use strict';
var React = require('react');
var HubClient = require('../utils/HubClient');
var LoginPage = require('./login/login-page.jsx');
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

    mixins: [Router.Navigation],
    
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

        console.log('_onChange', _getState());

        // if (this.state.loggedIn) {
        //     if (LoginPage.attemptedTransition) {
        //        var trans = LoginPage.attemptedTransition;
        //         LoginPage.attemptedTransition = null;
        //         trans.retry();
        //     } else {
        //         this.transitionTo('/scenes');
        //     }
        // }
        
    },

    handleLogout: function(event) {
        SceneActions.logout();
    },
    
    render: function() {
        var logout = this.state.loggedIn ? <button onClick={this.handleLogout} className='btn btn-link'>Log out</button> : null;

        //return  <LoginPage header='Media Scene Editor' element={<SceneEditor />} />; 
        if (this.state.attemptingLogin) {
            return <h1>Logging in...</h1>;
        } else {

            return (
                <div className='container'>
                    <div key='row' className='row'>
                        <div className='col-md-12'>
                            <h1>Media Scene Editor</h1>
                            {logout}
                        </div>
                    </div>
                    <RouteHandler key='handler' />
                </div>
            );    
        }   

        
    }

});

module.exports = App;
