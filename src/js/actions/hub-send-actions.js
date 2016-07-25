'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubClient = require('../utils/HubClient');
var HubRecieveActions = require('./hub-recieve-actions');
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

    tryCreateSceneGraph: function(name, cb) {
        var sceneGraph = {
            'name': name,
            'sceneIds': {},
            "graphThemes": {
                "city": {
                    "Entertainment": {},
                    "Tradition": {},
                    "Bonds": {},
                    "Cuisine": {},
                    "Diversity": {},
                    "Landscape": {},
                    "Politics": {},
                    "Transportation System": {},
                    "Native Performance": {},
                    "Night Market": {},
                    "Green Initiative": {},
                    "Changes": {},
                    "Technology": {},
                    "Landmarks": {},
                    "Signage": {},
                    "Historical Events": {},
                    "Nature": {},
                    "Sound Of Cities": {},
                    "Fusion Of Culture": {},
                    "Chicago": {},
                    "Manchester": {
                    },
                    "Beijing": {
                    },
                    "Dalian": {
                    },
                    "KualaLumpur": {
                    },
                    "Seoul": {
                    },
                    "Chengdu": {
                    },
                    "HongKong": {
                    },
                    "Shenyang": {
                    },
                    "Panjin": {
                    }
                },
                "people": {
                    "Conflict": {},
                    "Waterway": {},
                    "Sports": {},
                    "Culture": {},
                    "PaceOfLife": {},
                    "Art": {},
                    "Migration": {},
                    "Entertainment": {},
                    "Tradition": {},
                    "Bonds": {},
                    "Cuisine": {},
                    "Diversity": {},
                    "Landscape": {},
                    "Politics": {},
                    "Students Life": {},
                    "Fusion Of Language": {},
                    "Workforce": {},
                    "Aging Society": {},
                    "Youth Trends": {},
                    "Cross Culture": {},
                    "Chicago": {
                    },
                    "Manchester": {
                    },
                    "Beijing": {
                    },
                    "Dalian": {
                    },
                    "KualaLumpur": {
                    },
                    "Seoul": {
                    },
                    "Chengdu": {
                    },
                    "HongKong": {
                    },
                    "Shenyang": {
                    },
                    "Panjin": {
                    }
                },
                "movement": {
                    "Conflict": {},
                    "Waterway": {},
                    "Sports": {},
                    "Culture": {},
                    "PaceOfLife": {},
                    "Art": {},
                    "Migration": {},
                    "Transportation System": {},
                    "Native Performance": {},
                    "Night Market": {},
                    "Green Initiative": {},
                    "Changes": {},
                    "Technology": {},
                    "Evolution": {},
                    "Vitality": {},
                    "Travel": {},
                    "Performance": {},
                    "Night Life": {},
                    "Traffic": {},
                    "Chicago": {
                    },
                    "Manchester": {
                    },
                    "Beijing": {
                    },
                    "Dalian": {
                    },
                    "KualaLumpur": {
                    },
                    "Seoul": {
                    },
                    "Chengdu": {
                    },
                    "HongKong": {
                    },
                    "Shenyang": {
                    },
                    "Panjin": {
                    }
                }
            },
            'excludedThemes': {},
            'nodeList': []
        };

        HubClient.saveSceneGraph(sceneGraph, function(newSceneGraph) {
            HubRecieveActions.recieveSceneGraph(newSceneGraph);
            var AppRouter = require('../app-router.jsx');
            AppRouter.transitionTo('scenegraph', {id: newSceneGraph._id});
        });

    },

    tryCreateScene: function(name, cb) {
    	var scene = {
    		'name': name,
            'maximumOnScreen': {
                'image': 3,
                'text': 1,
                'video': 1,
                'audio': 1
            },
            'displayDuration': 10,
            'displayInterval': 3,
            'transitionDuration': 1.4,
            'themes': {},
            'style': {
                'backgroundColor': 'black'
            },
    		'scene': []
    	};

    	HubClient.save(scene, function(newScene) {
            HubRecieveActions.recieveScene(newScene);
            // deffer the loading of AppRouter to prevent circular dependencies,
            // this would be better done with dependency injection
            // http://tomkit.wordpress.com/2013/02/05/circular-dependencies-dependency-injection-in-node-js/
            var AppRouter = require('../app-router.jsx');
            AppRouter.transitionTo('scene', {id: newScene._id});
        });
    },
    loadScene: HubClient.loadScene,
    loadSceneGraph: HubClient.loadSceneGraph,
    subscribeScene: HubClient.subscribeScene,
    deleteScene: function(sceneId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.DELETE_SCENE,
            sceneId: sceneId
        });

        var AppRouter = require('../app-router.jsx');
        AppRouter.transitionTo('scenes');
    },
    unsubscribeScene: HubClient.unsubscribeScene
};
