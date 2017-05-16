'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubClient = require('../utils/HubClient');
var HubRecieveActions = require('./hub-recieve-actions');
var SceneActions = require('./scene-actions');
var hashHistory = require('react-router').hashHistory;

const GDC_SCENE_GRAPH_TYPE = "GDC_SCENE_GRAPH";
const MEMOIR_SCENE_GRAPH_TYPE = "MEMOIR_SCENE_GRAPH";
const NARM_SCENE_GRAPH_TYPE = "NARM_SCENE_GRAPH";

const ROOT_NODE_TYPE = "root";
const CITY_NODE_TYPE = "city";
const GTHEME_NODE_TYPE = "gtheme";
const CHAPER_NODE_TYPE = "chapter";

const GDC_GRAPH_VERSION = "1.0.0";
const GRAPH_ALPHA_VERSION = "alpha-1";

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

    getNewGDCSceneGraph: function(name) {
        return  {
            'name': name,
            'sceneIds': {},
            "type": GDC_SCENE_GRAPH_TYPE,
            "version": GDC_GRAPH_VERSION,
            "graphThemes": {
                type: "document",
                children: {
                    "city": {
                        type: ROOT_NODE_TYPE,
                        children: {
                            "Entertainment": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Tradition": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Bonds": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Cuisine": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Diversity": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Landscape": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Politics": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Transportation System": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Native Performance": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Night Market": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Green Initiative": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Changes": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Technology": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Landmarks": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Signage": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Historical Events": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Nature": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Sound Of Cities": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Fusion Of Culture": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Chicago": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Manchester": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Beijing": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Dalian": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "KualaLumpur": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Seoul": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Chengdu": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "HongKong": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Shenyang": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Panjin": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "GDC Experience": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                        }
                    },
                    "people": {
                        type: ROOT_NODE_TYPE,
                        children: {
                            "Conflict": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Waterway": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Sports": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Culture": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "PaceOfLife": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Art": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Migration": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Entertainment": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Tradition": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Bonds": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Cuisine": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Diversity": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Landscape": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Politics": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Students Life": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Fusion Of Language": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Workforce": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Aging Society": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Youth Trends": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Cross Culture": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Chicago": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Manchester": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Beijing": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Dalian": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "KualaLumpur": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Seoul": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Chengdu": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "HongKong": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Shenyang": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Panjin": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "GDC Experience": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                        }
                    },
                    "movement": {
                        type: ROOT_NODE_TYPE,
                        children: {
                            "Conflict": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Waterway": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Sports": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Culture": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "PaceOfLife": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Art": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Migration": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Transportation System": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Native Performance": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Night Market": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Green Initiative": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Changes": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Technology": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Evolution": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Vitality": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Travel": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Performance": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Night Life": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Traffic": {
                                type: GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Chicago": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Manchester": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Beijing": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Dalian": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "KualaLumpur": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Seoul": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Chengdu": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "HongKong": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Shenyang": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            },
                            "Panjin": {
                                type: CITY_NODE_TYPE,
                                children: {}
                            }
                        }
                    }
                }
            },
            'excludedThemes': {},
            'nodeList': []
        };
    },

    getNewNarmSceneGraph: function(name) {
        return {
            'name': name,
            'sceneIds': {},
            'type': NARM_SCENE_GRAPH_TYPE,
            'version': GRAPH_ALPHA_VERSION,
            'graphThemes': {
                type: "document",
                children: {
                    "root": {
                        type: ROOT_NODE_TYPE,
                        children: {

                        }
                    }
                }
            },
            'excludedThemes': {},
            'nodeList': []
        }
    },

    getNewMemoirSceneGraph: function(name) {
        return  {
            'name': name,
            'sceneIds': {},
            "type": MEMOIR_SCENE_GRAPH_TYPE,
            "version": GRAPH_ALPHA_VERSION,
            "graphThemes": {
                type: "document",
                children: {
                    "root": {
                        type: ROOT_NODE_TYPE,
                        children: {
                            "Chapter1": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter2": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter3": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter4": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter5": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter6": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter7": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter8": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter9": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter10": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter11": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter12": {
                                type: CHAPER_NODE_TYPE,
                                children: {}
                            },
                        }
                    }
                }
            },
            'excludedThemes': {},
            'nodeList': []
        };
    },

    tryCreateSceneGraph: function(name, type, cb) {

        var sceneGraph = {};

        if(type === GDC_SCENE_GRAPH_TYPE) {
            sceneGraph = this.getNewGDCSceneGraph(name);
        } else if (type === MEMOIR_SCENE_GRAPH_TYPE) {
            sceneGraph = this.getNewMemoirSceneGraph(name);
        } else {
            sceneGraph = this.getNewNarmSceneGraph(name);
        }

        HubClient.saveSceneGraph(sceneGraph, function(newSceneGraph) {
            HubRecieveActions.recieveSceneGraph(newSceneGraph);
            hashHistory.push('scenegraph/' + newSceneGraph._id);
        });

    },

    tryCreateScene: function(name, cb) {
    	var scene = {
    		'name': name,
            'version': "0.1",
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
            hashHistory.push('scene/' + newScene._id);
        });
    },
    loadScene: HubClient.loadScene,
    loadSceneGraph: HubClient.loadSceneGraph,
    getSceneGraphByID:function(id){HubClient.getSceneGraph(id)} ,
    subscribeScene: HubClient.subscribeScene,
    deleteScene: function(sceneId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.DELETE_SCENE,
            sceneId: sceneId
        });
        hashHistory.push('scenes');
    },
    deleteSceneGraph: function(sceneGraphId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.DELETE_SCENE_GRAPH,
            sceneGraphId: sceneGraphId
        });
        hashHistory.push('scenegraphs');
    },
    unsubscribeScene: HubClient.unsubscribeScene
};
