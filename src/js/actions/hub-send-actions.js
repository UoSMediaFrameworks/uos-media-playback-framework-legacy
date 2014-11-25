'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubClient = require('../utils/HubClient');

module.exports = {
    tryLogin: function(url, password) {
    	HubClient.login(url, password);
    	AppDispatcher.handleViewAction({
    		type: ActionTypes.HUB_LOGIN_ATTEMPT
    	});
    },
    loadScene: function(id) {
    	HubClient.loadScene(id);
    }
};