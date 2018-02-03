'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubClient = require('../utils/HubClient');
var HubRecieveActions = require('./hub-recieve-actions');
var SceneActions = require('./scene-actions');
var hashHistory = require('react-router').hashHistory;

var GraphTypes = require('../constants/graph-constants').GraphTypes;
var GraphNodeTypes = require('../constants/graph-constants').GraphNodeTypes;
var GraphVersions = require('../constants/graph-constants').GraphVersions;


module.exports = {
    tryLogin: function (creds) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGIN_ATTEMPT,
            authType: 'user'
        });
        // coming from envify
        HubClient.login(process.env.MEDIA_HUB, creds);
    },

    tryTokenLogin: function () {
        AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGIN_ATTEMPT,
            authType: 'token'
        });
        HubClient.login(process.env.MEDIA_HUB);
    },

    getNewGDCSceneGraph: function (name) {
        return {
            'name': name,
            'sceneIds': {},
            "type": GraphTypes.GDC,
            "version": GraphVersions.GDC_GRAPH_VERSION,
            "graphThemes": {
                type: "document",
                children: {
                    "city": {
                        type: GraphNodeTypes.ROOT_NODE_TYPE,
                        children: {
                            "Entertainment": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Tradition": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Bonds": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Cuisine": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Diversity": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Landscape": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Politics": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Transportation System": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Native Performance": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Night Market": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Green Initiative": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Changes": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Technology": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Landmarks": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Signage": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Historical Events": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Nature": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Sound Of Cities": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Fusion Of Culture": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Chicago": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Manchester": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Beijing": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Dalian": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "KualaLumpur": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Seoul": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Chengdu": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "HongKong": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Shenyang": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Panjin": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "GDC Experience": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                        }
                    },
                    "people": {
                        type: GraphNodeTypes.ROOT_NODE_TYPE,
                        children: {
                            "Conflict": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Waterway": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Sports": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Culture": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "PaceOfLife": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Art": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Migration": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Entertainment": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Tradition": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Bonds": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Cuisine": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Diversity": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Landscape": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Politics": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Students Life": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Fusion Of Language": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Workforce": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Aging Society": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Youth Trends": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Cross Culture": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Chicago": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Manchester": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Beijing": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Dalian": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "KualaLumpur": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Seoul": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Chengdu": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "HongKong": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Shenyang": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Panjin": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "GDC Experience": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                        }
                    },
                    "movement": {
                        type: GraphNodeTypes.ROOT_NODE_TYPE,
                        children: {
                            "Conflict": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Waterway": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Sports": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Culture": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "PaceOfLife": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Art": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Migration": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Transportation System": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Native Performance": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Night Market": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Green Initiative": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Changes": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Technology": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Evolution": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Vitality": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Travel": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Performance": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Night Life": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Traffic": {
                                type: GraphNodeTypes.GTHEME_NODE_TYPE,
                                children: {}
                            },
                            "Chicago": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Manchester": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Beijing": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Dalian": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "KualaLumpur": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Seoul": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Chengdu": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "HongKong": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Shenyang": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
                                children: {}
                            },
                            "Panjin": {
                                type: GraphNodeTypes.CITY_NODE_TYPE,
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
    getNewNarmSceneGraph: function (name) {
        return {
            'name': name,
            'sceneIds': {},
            'type': GraphTypes.NARM,
            'version': GraphVersions.GRAPH_ALPHA_VERSION,
            'graphThemes': {
                type: "document",
                children: {
                    "root": {
                        type: GraphNodeTypes.ROOT_NODE_TYPE,
                        children: {}
                    }
                }
            },
            'excludedThemes': {},
            'nodeList': []
        }
    },
    getNewThumbnailSceneGraph: function (name) {
        return {
            'name': name,
            'sceneIds': {},
            'type': GraphTypes.THUMBNAIL,
            'version': GraphVersions.GRAPH_ALPHA_VERSION,
            'graphThemes': {
                type: "document",
                children: {
                    "Textiles": {
                        type: GraphNodeTypes.ROOT_NODE_TYPE,
                        children: {}
                    }
                }
            },
            'excludedThemes': {},
            'nodeList': []
        }
    },
    getNewMemoirSceneGraph: function (name) {
        return {
            'name': name,
            'sceneIds': {},
            "type": GraphTypes.MEMOIR,
            "version": GraphVersions.GRAPH_ALPHA_VERSION,
            "graphThemes": {
                type: "document",
                children: {
                    "root": {
                        type: GraphNodeTypes.ROOT_NODE_TYPE,
                        children: {
                            "Chapter1": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter2": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter3": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter4": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter5": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter6": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter7": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter8": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter9": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter10": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter11": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
                                children: {}
                            },
                            "Chapter12": {
                                type: GraphNodeTypes.CHAPER_NODE_TYPE,
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
    getNewCeramicSceneGraph: function () {
        return {
            'name': name,
            'sceneIds': {},
            'type': GraphTypes.CERAMIC,
            'version': GraphVersions.GRAPH_ALPHA_VERSION,

            "graphThemes" : {
                "type" : "document",
                "children" : {
                    "Ceramics" : {
                        "type" : GraphNodeTypes.ROOT_NODE_TYPE,
                        "children" : {
                            "Vase": {
                                "type": GraphNodeTypes.GTHEME_NODE_TYPE,
                                "children": {
                                    "MoonVase" : {
                                        "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                        "children" : {
                                            "MoonVaseTexture" : {
                                                "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                                "children" : {}
                                            },
                                            "MoonVaseColour" : {
                                                "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                                "children" : {
                                                }
                                            }
                                        }
                                    },
                                    "TallVase" : {
                                        "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                        "children" : {
                                            "TallVaseTexture" : {
                                                "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                                "children" : {}
                                            },
                                            "TallVaseColour" : {
                                                "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                                "children" : {
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "Sahbal" : {
                                "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                "children" : {
                                    "SahbalTexture" : {
                                        "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                        "children" : {}
                                    },
                                    "SahbalColour" : {
                                        "type" : GraphNodeTypes.GTHEME_NODE_TYPE,
                                        "children" : {}
                                    }
                                }
                            }
                        }
                    },
                    "Texture": {
                        "type": GraphNodeTypes.ROOT_NODE_TYPE,
                        "children": {

                        }
                    },
                    "Colour": {
                        "type": GraphNodeTypes.ROOT_NODE_TYPE,
                        "children": {

                        }
                    }
                }
            },

            'excludedThemes': {},
            'nodeList': []
        }
    },
    getNewSoundSceneGraph:function(name){
        return {
            'name': name,
            'sceneIds': {},
            'type': GraphTypes.SOUND,
            'version': GraphVersions.GRAPH_ALPHA_VERSION,
            'graphThemes': {
                type: "document",
                children: {
                    "SOUNDS": {
                        type: GraphNodeTypes.ROOT_NODE_TYPE,
                        children: {}
                    }
                }
            },
            'excludedThemes': {},
            'nodeList': []
        }
    },
    tryCreateSceneGraph: function (name, type, cb) {

        var sceneGraph = {};

        // TODO we need a better null case here - probably an error message to the user and no attempt to save would be best.
        if (type === GraphTypes.GDC) {
            sceneGraph = this.getNewGDCSceneGraph(name);
        } else if (type === GraphTypes.MEMOIR) {
            sceneGraph = this.getNewMemoirSceneGraph(name);
        } else if (type === GraphTypes.NARM) {
            sceneGraph = this.getNewNarmSceneGraph(name);
        } else if (type === GraphTypes.THUMBNAIL) {
            sceneGraph = this.getNewThumbnailSceneGraph(name);
        } else if (type === GraphTypes.CERAMIC) {
            sceneGraph = this.getNewCeramicSceneGraph(name);
        }else if (type === GraphTypes.SOUND) {
            sceneGraph = this.getNewSoundSceneGraph(name);
        }

        HubClient.saveSceneGraph(sceneGraph, function (newSceneGraph) {
            HubRecieveActions.savedSceneGraph(newSceneGraph);
            HubRecieveActions.recieveSceneGraph(newSceneGraph);
        });
    },

    tryCreateScene: function (name, cb) {
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

        HubClient.save(scene, function (newScene) {
            HubRecieveActions.savedScene(newScene);
            HubRecieveActions.recieveScene(newScene);
        });
    },
    loadScene: HubClient.loadScene,
    loadSceneGraph: HubClient.loadSceneGraph,
    getSceneGraphByID: function (id) {
        HubClient.getSceneGraph(id)
    },
    subscribeScene: HubClient.subscribeScene,
    deleteScene: function (sceneId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.DELETE_SCENE,
            sceneId: sceneId
        });
    },
    deleteSceneGraph: function (sceneGraphId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.DELETE_SCENE_GRAPH,
            sceneGraphId: sceneGraphId
        });

    },
    unsubscribeScene: HubClient.unsubscribeScene
};
