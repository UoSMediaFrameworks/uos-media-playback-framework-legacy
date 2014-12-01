var LoginPage = require('../components/login/login-page.jsx');
var ClientStore = require('../stores/client-store');

module.exports = {
    statics: {
        willTransitionTo: function(transition) {
            if(! ClientStore.loggedIn()) {
                LoginPage.attemptedTransition = transition;
                transition.redirect('/login');
            }
        }
    }
};