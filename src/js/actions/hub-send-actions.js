'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubClient = require('../utils/HubClient');
var SceneActions = require('./scene-actions');

module.exports = {
    tryLogin: function(creds) {
    	AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGIN_ATTEMPT,
            authType: 'user'
        });
        // coming from envify
        HubClient.login(process.env.MEDIA_HUB, creds);
    },

    tryTokenLogin: function() {
        AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGIN_ATTEMPT,
            authType: 'token'
        });
        HubClient.login(process.env.MEDIA_HUB);
    },

    tryCreateScene: function(name, cb) {
    	var scene = {
    		'name': name,
    		'scene': []
    	};

    	HubClient.save(scene, function(newScene) {
            SceneActions.updateScene(newScene);
            // deffer the loading of AppRouter to prevent circular dependencies, 
            // this would be better done with dependency injection
            // http://tomkit.wordpress.com/2013/02/05/circular-dependencies-dependency-injection-in-node-js/
            var AppRouter = require('../app-router.jsx');
            AppRouter.transitionTo('scene', {id: newScene._id});
        });
    },
    saveScene: function(scene) {
        HubClient.save(scene);
    },
    loadScene: HubClient.loadScene,
    subscribeScene: HubClient.subscribeScene,
    deleteScene: function(sceneId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.DELETE_SCENE,
            sceneId: sceneId
        });

        HubClient.deleteScene(sceneId);
        var AppRouter = require('../app-router.jsx');
        AppRouter.transitionTo('scenes');
    },
    unsubscribeScene: HubClient.unsubscribeScene
};