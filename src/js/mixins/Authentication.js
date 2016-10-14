'use strict';

var LoginPage = require('../pages/login-page.jsx');
var ClientStore = require('../stores/client-store');

module.exports = {
    statics: {
        willTransitionTo: function(transition) {

            console.log("WARNING: deprecated - see index.jsx router for update based of newer version of react + routing");

            if(! ClientStore.loggedIn()) {
                LoginPage.attemptedTransition = transition;
                transition.redirect('/login');
            }
        }
    }
};
