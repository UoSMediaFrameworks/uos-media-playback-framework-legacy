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
                type: "document",
                children: {
                    "city": {
                        type: "root",
                        children: {
                            "Entertainment": {
                                type: "gtheme",
                                children: {}
                            },
                            "Tradition": {
                                type: "gtheme",
                                children: {}
                            },
                            "Bonds": {
                                type: "gtheme",
                                children: {}
                            },
                            "Cuisine": {
                                type: "gtheme",
                                children: {}
                            },
                            "Diversity": {
                                type: "gtheme",
                                children: {}
                            },
                            "Landscape": {
                                type: "gtheme",
                                children: {}
                            },
                            "Politics": {
                                type: "gtheme",
                                children: {}
                            },
                            "Transportation System": {
                                type: "gtheme",
                                children: {}
                            },
                            "Native Performance": {
                                type: "gtheme",
                                children: {}
                            },
                            "Night Market": {
                                type: "gtheme",
                                children: {}
                            },
                            "Green Initiative": {
                                type: "gtheme",
                                children: {}
                            },
                            "Changes": {
                                type: "gtheme",
                                children: {}
                            },
                            "Technology": {
                                type: "gtheme",
                                children: {}
                            },
                            "Landmarks": {
                                type: "gtheme",
                                children: {}
                            },
                            "Signage": {
                                type: "gtheme",
                                children: {}
                            },
                            "Historical Events": {
                                type: "gtheme",
                                children: {}
                            },
                            "Nature": {
                                type: "gtheme",
                                children: {}
                            },
                            "Sound Of Cities": {
                                type: "gtheme",
                                children: {}
                            },
                            "Fusion Of Culture": {
                                type: "gtheme",
                                children: {}
                            },
                            "Chicago": {
                                type: "city",
                                children: {}
                            },
                            "Manchester": {
                                type: "city",
                                children: {}
                            },
                            "Beijing": {
                                type: "city",
                                children: {}
                            },
                            "Dalian": {
                                type: "city",
                                children: {}
                            },
                            "KualaLumpur": {
                                type: "city",
                                children: {}
                            },
                            "Seoul": {
                                type: "city",
                                children: {}
                            },
                            "Chengdu": {
                                type: "city",
                                children: {}
                            },
                            "HongKong": {
                                type: "city",
                                children: {}
                            },
                            "Shenyang": {
                                type: "city",
                                children: {}
                            },
                            "Panjin": {
                                type: "city",
                                children: {}
                            },
                            "GDC Experience": {
                                type: "gtheme",
                                children: {}
                            },
                        }
                    },
                    "people": {
                        type: "root",
                        children: {
                            "Conflict": {
                                type: "gtheme",
                                children: {}
                            },
                            "Waterway": {
                                type: "gtheme",
                                children: {}
                            },
                            "Sports": {
                                type: "gtheme",
                                children: {}
                            },
                            "Culture": {
                                type: "gtheme",
                                children: {}
                            },
                            "PaceOfLife": {
                                type: "gtheme",
                                children: {}
                            },
                            "Art": {
                                type: "gtheme",
                                children: {}
                            },
                            "Migration": {
                                type: "gtheme",
                                children: {}
                            },
                            "Entertainment": {
                                type: "gtheme",
                                children: {}
                            },
                            "Tradition": {
                                type: "gtheme",
                                children: {}
                            },
                            "Bonds": {
                                type: "gtheme",
                                children: {}
                            },
                            "Cuisine": {
                                type: "gtheme",
                                children: {}
                            },
                            "Diversity": {
                                type: "gtheme",
                                children: {}
                            },
                            "Landscape": {
                                type: "gtheme",
                                children: {}
                            },
                            "Politics": {
                                type: "gtheme",
                                children: {}
                            },
                            "Students Life": {
                                type: "gtheme",
                                children: {}
                            },
                            "Fusion Of Language": {
                                type: "gtheme",
                                children: {}
                            },
                            "Workforce": {
                                type: "gtheme",
                                children: {}
                            },
                            "Aging Society": {
                                type: "gtheme",
                                children: {}
                            },
                            "Youth Trends": {
                                type: "gtheme",
                                children: {}
                            },
                            "Cross Culture": {
                                type: "gtheme",
                                children: {}
                            },
                            "Chicago": {
                                type: "city",
                                children: {}
                            },
                            "Manchester": {
                                type: "city",
                                children: {}
                            },
                            "Beijing": {
                                type: "city",
                                children: {}
                            },
                            "Dalian": {
                                type: "city",
                                children: {}
                            },
                            "KualaLumpur": {
                                type: "city",
                                children: {}
                            },
                            "Seoul": {
                                type: "city",
                                children: {}
                            },
                            "Chengdu": {
                                type: "city",
                                children: {}
                            },
                            "HongKong": {
                                type: "city",
                                children: {}
                            },
                            "Shenyang": {
                                type: "city",
                                children: {}
                            },
                            "Panjin": {
                                type: "city",
                                children: {}
                            },
                            "GDC Experience": {
                                type: "gtheme",
                                children: {}
                            },
                        }
                    },
                    "movement": {
                        type: "root",
                        children: {
                            "Conflict": {
                                type: "gtheme",
                                children: {}
                            },
                            "Waterway": {
                                type: "gtheme",
                                children: {}
                            },
                            "Sports": {
                                type: "gtheme",
                                children: {}
                            },
                            "Culture": {
                                type: "gtheme",
                                children: {}
                            },
                            "PaceOfLife": {
                                type: "gtheme",
                                children: {}
                            },
                            "Art": {
                                type: "gtheme",
                                children: {}
                            },
                            "Migration": {
                                type: "gtheme",
                                children: {}
                            },
                            "Transportation System": {
                                type: "gtheme",
                                children: {}
                            },
                            "Native Performance": {
                                type: "gtheme",
                                children: {}
                            },
                            "Night Market": {
                                type: "gtheme",
                                children: {}
                            },
                            "Green Initiative": {
                                type: "gtheme",
                                children: {}
                            },
                            "Changes": {
                                type: "gtheme",
                                children: {}
                            },
                            "Technology": {
                                type: "gtheme",
                                children: {}
                            },
                            "Evolution": {
                                type: "gtheme",
                                children: {}
                            },
                            "Vitality": {
                                type: "gtheme",
                                children: {}
                            },
                            "Travel": {
                                type: "gtheme",
                                children: {}
                            },
                            "Performance": {
                                type: "gtheme",
                                children: {}
                            },
                            "Night Life": {
                                type: "gtheme",
                                children: {}
                            },
                            "Traffic": {
                                type: "gtheme",
                                children: {}
                            },
                            "Chicago": {
                                type: "city",
                                children: {}
                            },
                            "Manchester": {
                                type: "city",
                                children: {}
                            },
                            "Beijing": {
                                type: "city",
                                children: {}
                            },
                            "Dalian": {
                                type: "city",
                                children: {}
                            },
                            "KualaLumpur": {
                                type: "city",
                                children: {}
                            },
                            "Seoul": {
                                type: "city",
                                children: {}
                            },
                            "Chengdu": {
                                type: "city",
                                children: {}
                            },
                            "HongKong": {
                                type: "city",
                                children: {}
                            },
                            "Shenyang": {
                                type: "city",
                                children: {}
                            },
                            "Panjin": {
                                type: "city",
                                children: {}
                            }
                        }
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
