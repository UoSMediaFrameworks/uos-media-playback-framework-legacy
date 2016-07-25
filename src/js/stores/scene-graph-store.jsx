'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubClient = require('../utils/HubClient');
var SceneStore = require('./scene-store');
var ConnectionCache = require('../utils/connection-cache');

var CHANGE_EVENT = "change";
var _sceneGraphs = {};

function _updateSceneGraph (sceneGraph) {
    _sceneGraphs[sceneGraph._id] = sceneGraph;
}

function _addSceneToSceneGraph (sceneGraphId, sceneId) {
    console.log("_addSceneToSceneGraph: [sceneGraphId: " + sceneGraphId + ", sceneId: " + sceneId + "]");

    //TODO get new scene
    var newScene = SceneStore.getScene(sceneId);

    var newSceneThemeList = Object.keys(newScene.themes);
    var currentlyExcludedThemes = Object.keys(_sceneGraphs[sceneGraphId].excludedThemes);

    var sceneThemesToAdd = [];  //get theme list by removing an excluded themes from the new scenes themelist
    for(var themeIndex in newSceneThemeList) {
        var proposedThemeId = newSceneThemeList[themeIndex];

        if(currentlyExcludedThemes.indexOf(proposedThemeId) === -1) {
            sceneThemesToAdd.push(proposedThemeId);
        }
    }

    //Hack to get the city node name from login session
    var sceneCity = ConnectionCache.getShortGroupName(ConnectionCache.getGroupID());
    sceneCity = sceneCity.split(' ').join('');

    console.log("The scene city found: ", sceneCity);

    //For each root node, find the city node then add each new theme as child
    _.forEach(Object.keys(_sceneGraphs[sceneGraphId].graphThemes), function(rootNodeProperty){
        var rootNode =  _sceneGraphs[sceneGraphId].graphThemes[rootNodeProperty];

        var cityNode = rootNode[sceneCity];

        _.forEach(sceneThemesToAdd, function(themeId) {
            cityNode[themeId] = {};
        });

    });

    console.log("_addSceneToSceneGraph: ", _sceneGraphs[sceneGraphId]);

    //finally add the scene id to the document
    _sceneGraphs[sceneGraphId].sceneIds[sceneId] = sceneId;
}

function _removeThemesForNode (currentNode, themeIdsToRemove) {

    _.forEach(Object.keys(currentNode), function(nodePropertyKey){

        if(themeIdsToRemove.indexOf(nodePropertyKey) === -1) {
            _removeThemesForNode(currentNode[nodePropertyKey], themeIdsToRemove);
        } else {
            delete currentNode[nodePropertyKey];
        }
    });

}

function _removeThemesFromStructureForSceneRemoval (sceneGraph, themeIdsToRemove) {

    _removeThemesForNode(sceneGraph.graphThemes, themeIdsToRemove);

    console.log("_removeThemesFromStructureForSceneRemoval", sceneGraph.graphThemes)
}

function _removeSceneFromSceneGraph (sceneGraphId, sceneId) {
    var sceneGraph = _.cloneDeep(_sceneGraphs[sceneGraphId]);

    var sceneGraphSceneIds = Object.keys(sceneGraph.sceneIds);

    var allSceneGraphScenes = _.map(sceneGraphSceneIds, function(sgSceneId){
        return SceneStore.getScene(sgSceneId);
    });

    var remainingSceneGraphScenes = _.filter(allSceneGraphScenes, function(scene){
        return scene._id !== sceneId;
    }); //All the scenes that are to remain are left

    var sceneThemeLists = _.map(remainingSceneGraphScenes, function(scene){
        return Object.keys(scene.themes);
    });

    var remainingThemeList = [];

    _.forEach(sceneThemeLists, function(themeList){
        _.forEach(themeList, function(themeId) {
            remainingThemeList.push(themeId);
        });
    });

    var themeIdsForSceneBeingRemoved = Object.keys(SceneStore.getScene(sceneId).themes);

    var themeIdsToRemove = _.filter(themeIdsForSceneBeingRemoved, function(themeIdForRemoval){
        return remainingThemeList.indexOf(themeIdForRemoval) === -1;
    });

    _removeThemesFromStructureForSceneRemoval(_sceneGraphs[sceneGraphId], themeIdsToRemove);

    delete _sceneGraphs[sceneGraphId].sceneIds[sceneId];
}

function _addThemeExclusion (sceneGraphId, themeId) {
    console.log("_addThemeExclusion: ", { sceneGraphId: sceneGraphId, themeId: themeId});

    _sceneGraphs[sceneGraphId].excludedThemes[themeId] = {};

    var excludedThemes = Object.keys(_sceneGraphs[sceneGraphId].excludedThemes);

    _removeThemesForNode(_sceneGraphs[sceneGraphId].graphThemes, excludedThemes);

    console.log("_addThemeExclusion - removed themes fron structure");

}

function _deleteThemeExclusion (sceneGraphId, themeId) {
    console.log("_deleteThemeExclusion: ", { sceneGraphId: sceneGraphId, themeId: themeId});


    //Hack to get the city node name from login session
    var sceneCity = ConnectionCache.getShortGroupName(ConnectionCache.getGroupID());
    sceneCity = sceneCity.split(' ').join('');

    console.log("The scene city found: ", sceneCity);

    //For each root node, find the city node then add each theme as child
    _.forEach(Object.keys(_sceneGraphs[sceneGraphId].graphThemes), function(rootNodeProperty){
        var rootNode =  _sceneGraphs[sceneGraphId].graphThemes[rootNodeProperty];

        var cityNode = rootNode[sceneCity];

        cityNode[themeId] = {};

    });


    delete _sceneGraphs[sceneGraphId].excludedThemes[themeId];
}

function _addThemeToSceneGraphStructure (sceneGraphId, themeId, parentList, parentKey) {
    console.log("_addThemeToSceneGraphStructure", { sceneGraphId: sceneGraphId, themeId: themeId, parent:parent, parentKey: parentKey});
    var graphThemes = _sceneGraphs[sceneGraphId]['graphThemes'];
    for(var parentIndex in parentList) {
        var parentKey = parentList[parentIndex];
        graphThemes = graphThemes[parentKey];
    }
    graphThemes[themeId] = {};
}

function _deleteThemeFromSceneGraphStructure (sceneGraphId, themeId, parentList, parentKey) {
    console.log("_deleteThemeFromSceneGraphStructure", { sceneGraphId: sceneGraphId, themeId: themeId, parent:parent, parentKey: parentKey});
    var graphThemes = _sceneGraphs[sceneGraphId]['graphThemes'];
    for(var i = 0; i < parentList.length - 1 ; i++) {
        var parentKey = parentList[i];
        graphThemes = graphThemes[parentKey];
    }
    delete graphThemes[themeId];
}

var SceneGraphStore = assign({}, EventEmitter.prototype, {
    getSceneGraph: function(id) {
        if (_sceneGraphs.hasOwnProperty(id)) {
            return _.cloneDeep(_sceneGraphs[id]);
        }
    },
    emitChange: function(){
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback){
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback){
        this.removeListener(CHANGE_EVENT, callback);
    },

    dispatcherIndex: AppDispatcher.register(function(payload){
        var action = payload.action; // this is our action from handleViewAction
        switch(action.type){
            // should only be triggered when server sends data back, so no need to save
            case ActionTypes.RECEIVE_SCENE_GRAPH:
                _updateSceneGraph(action.sceneGraph);
                SceneGraphStore.emitChange();
                break;
            case ActionTypes.SCENE_GRAPH_ADD_SCENE:
                _addSceneToSceneGraph(action.sceneGraphId, action.sceneId);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_REMOVE_SCENE:
                _removeSceneFromSceneGraph(action.sceneGraphId, action.sceneId);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_SELECTION:
                SceneGraphStore.emitChange();
                break;
            case ActionTypes.SCENE_GRAPH_EXCLUDE_THEME:
                _addThemeExclusion(action.sceneGraphId, action.themeId);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_INCLUDE_THEME:
                _deleteThemeExclusion(action.sceneGraphId, action.themeId);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_ADD_THEME_TO_STRUCTURE:
                _addThemeToSceneGraphStructure(action.sceneGraphId, action.themeId, action.parentList, action.parentKey);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_REMOVE_THEME_FROM_STRUCTURE:
                _deleteThemeFromSceneGraphStructure(action.sceneGraphId, action.themeId, action.parentList, action.parentKey);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
        }

        SceneGraphStore.emitChange();

        return true;
    })
});

module.exports = SceneGraphStore;
