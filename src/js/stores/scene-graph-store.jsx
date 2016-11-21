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

/**
 * Update local cache _sceneGraphs for a scene graph
 * @param sceneGraph
 * @private
 */
function _updateSceneGraph (sceneGraph) {
    _sceneGraphs[sceneGraph._id] = sceneGraph;
}

/**
 * Adds a new scene to a scene graph
 *
 * Maps all sthemes for the new scene into the appriopriate city nodes :: GDC 2016
 * @param sceneGraphId
 * @param sceneId
 * @private
 */
function _addSceneToSceneGraph (sceneGraphId, sceneId) {
    console.log("_addSceneToSceneGraph: [sceneGraphId: " + sceneGraphId + ", sceneId: " + sceneId + "]");

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

    if(_sceneGraphs[sceneGraphId].type === "GDC_SCENE_GRAPH") { //APEP: Memoir graphs do not wish to use this functionality

        console.log("Appending sthemes into graph - GDC Scene Graph - scene addition action");

        //Hack to get the city node name from login session :: GDC 2016
        var sceneCity = ConnectionCache.getShortGroupName(ConnectionCache.getGroupID());
        sceneCity = sceneCity.split(' ').join('');

        console.log("The scene city found: ", sceneCity);

        //APEP: For each root node, find the city node then add each new theme as child :: GDC 2016
        _.forEach(Object.keys(_sceneGraphs[sceneGraphId].graphThemes.children), function(rootNodeProperty){
            var rootNode =  _sceneGraphs[sceneGraphId].graphThemes.children[rootNodeProperty];

            var cityNode = rootNode.children[sceneCity];

            _.forEach(sceneThemesToAdd, function(themeId) {
                cityNode.children[themeId] = {
                    type: "stheme",
                    children: {}
                };
            });

        });
    }

    console.log("_addSceneToSceneGraph: ", _sceneGraphs[sceneGraphId]);

    //finally add the scene id to the document
    _sceneGraphs[sceneGraphId].sceneIds[sceneId] = sceneId;
}

/**
 * Recursively processes the data structure to remove themeIds for sthemes only
 * @param currentNode
 * @param themeIdsToRemove
 * @private
 */
function _removeThemesForNode (currentNode, themeIdsToRemove) {

    console.log("ThemeIdsToRemove: ", themeIdsToRemove);

    _.forEach(Object.keys(currentNode.children), function(nodePropertyKey){

        if(themeIdsToRemove.indexOf(nodePropertyKey) === -1 && currentNode.type !== 'stheme') {
            _removeThemesForNode(currentNode.children[nodePropertyKey], themeIdsToRemove);
        } else {
            if(currentNode.children[nodePropertyKey].type === 'stheme') {
                delete currentNode.children[nodePropertyKey];
            } else {
                _removeThemesForNode(currentNode.children[nodePropertyKey], themeIdsToRemove);
            }
        }
    });

}

function _removeThemesFromStructureForSceneRemoval (sceneGraph, themeIdsToRemove) {

    _removeThemesForNode(sceneGraph.graphThemes, themeIdsToRemove);

    console.log("_removeThemesFromStructureForSceneRemoval", sceneGraph.graphThemes)
}


/**
 * Removes a scene from a scene graph
 *
 * Further processes the scene being removed to remove all sthemes from the data structure :: GDC 2016
 * @param sceneGraphId
 * @param sceneId
 * @private
 */
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

/**
 * Excludes a theme from the scene graph
 *
 * Further removes the theme from the data structure - clean up of auto mapping to city nodes :: GDC 2016
 * @param sceneGraphId
 * @param themeId
 * @private
 */
function _addThemeExclusion (sceneGraphId, themeId) {
    console.log("_addThemeExclusion: ", { sceneGraphId: sceneGraphId, themeId: themeId});

    _sceneGraphs[sceneGraphId].excludedThemes[themeId] = {};

    var excludedThemes = Object.keys(_sceneGraphs[sceneGraphId].excludedThemes);

    _removeThemesForNode(_sceneGraphs[sceneGraphId].graphThemes, excludedThemes);

    console.log("_addThemeExclusion - removed themes fron structure");

}

/**
 * Removes a theme excludes
 *
 * Further adds the theme back into the scene graph for the city mapping :: GDC 2016
 * @param sceneGraphId
 * @param themeId
 * @private
 */
function _deleteThemeExclusion (sceneGraphId, themeId) {
    console.log("_deleteThemeExclusion: ", { sceneGraphId: sceneGraphId, themeId: themeId});

    //Hack to get the city node name from login session
    var sceneCity = ConnectionCache.getShortGroupName(ConnectionCache.getGroupID());
    sceneCity = sceneCity.split(' ').join('');

    console.log("The scene city found: ", sceneCity);

    if(_sceneGraphs[sceneGraphId].type === "GDC_SCENE_GRAPH") { //APEP: Memoir graphs do not wish to use this functionality
        //For each root node, find the city node then add each theme as child
        _.forEach(Object.keys(_sceneGraphs[sceneGraphId].graphThemes.children), function(rootNodeProperty){
            var rootNode =  _sceneGraphs[sceneGraphId].graphThemes.children[rootNodeProperty];

            var cityNode = rootNode.children[sceneCity];

            cityNode.children[themeId] = {
                type: "stheme",
                children: {}
            };

        });
    }

    delete _sceneGraphs[sceneGraphId].excludedThemes[themeId];
}

/**
 * Ensures all gthemes have correct children for new child
 * @param node
 * @param gThemeId
 * @param newThemeId
 * @param parentType
 * @private
 */
function _addChildForEachGTheme(node, gThemeId, newThemeId, parentType) {

    _.forEach(Object.keys(node.children), function(childProperty){

        var child = node.children[childProperty];

        if(childProperty === gThemeId && child.type === parentType) { //TODO this if constraints addition to ONLY GThemes, the parentList needs to be refactored to give parent type to include instead of hardcoded "gtheme"
            child.children[newThemeId] = {
                type: 'stheme',
                children: {}
            };
        } else {
            _addChildForEachGTheme(child, gThemeId, newThemeId, parentType);
        }
    });
}

function _addThemeToSceneGraphStructure (sceneGraphId, themeId, parentList, parentKey, parentType) {
    console.log("_addThemeToSceneGraphStructure", { sceneGraphId: sceneGraphId, themeId: themeId, parentList:parentList, parentKey: parentKey});

    var graphThemes = _sceneGraphs[sceneGraphId]['graphThemes'];

    if(parentType === "gtheme") { //recursively ensure all gthemes have the new themeId
        _addChildForEachGTheme(graphThemes, parentList.pop(), themeId, parentType)
    } else { //add the single theme element into the structure
        for(var parentIndex in parentList) {
            var parentKey = parentList[parentIndex];
            graphThemes = graphThemes.children[parentKey];
        }
        graphThemes.children[themeId] = {
            type: 'stheme',
            children: {}
        };
    }
}

function _deleteChildForEachGTheme(node, gThemeId, oldThemeId) {

    _.forEach(Object.keys(node.children), function(childProperty){

        var child = node.children[childProperty];

        if(child.type === "gtheme" && childProperty === gThemeId) {
            if(child.children.hasOwnProperty(oldThemeId)) {
                delete child.children[oldThemeId];
            }
        }

        _deleteChildForEachGTheme(child, gThemeId, oldThemeId);
    });
}

function _deleteThemeFromSceneGraphStructure (sceneGraphId, themeId, parentList, parentKey) {
    console.log("_deleteThemeFromSceneGraphStructure", { sceneGraphId: sceneGraphId, themeId: themeId, parent:parent, parentKey: parentKey});

    var graphThemes = _sceneGraphs[sceneGraphId]['graphThemes'];

    for(var i = 0; i < parentList.length - 1 ; i++) {
        var parentKey = parentList[i];
        graphThemes = graphThemes.children[parentKey];
    }

    var parentOfThemeType = graphThemes.type;

    if(parentOfThemeType === "gtheme") { //recursively ensure all gthemes have themeId removed
        graphThemes = _sceneGraphs[sceneGraphId]['graphThemes'];
        parentList.pop(); //Hack to parent key for the key being removed as we need to delete from the parent property children
        _deleteChildForEachGTheme(graphThemes, parentList.pop(), themeId);
    } else {
        delete graphThemes.children[themeId];
    }

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
                SceneGraphStore.emitChange();
                break;
            case ActionTypes.SCENE_GRAPH_REMOVE_SCENE:
                _removeSceneFromSceneGraph(action.sceneGraphId, action.sceneId);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                SceneGraphStore.emitChange();
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
                SceneGraphStore.emitChange();
                break;
            case ActionTypes.SCENE_GRAPH_ADD_THEME_TO_STRUCTURE:
                _addThemeToSceneGraphStructure(action.sceneGraphId, action.themeId, action.parentList, action.parentKey, action.parentType);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.SCENE_GRAPH_REMOVE_THEME_FROM_STRUCTURE:
                _deleteThemeFromSceneGraphStructure(action.sceneGraphId, action.themeId, action.parentList, action.parentKey);
                var sceneGraph = _sceneGraphs[action.sceneGraphId];
                HubClient.saveSceneGraph(sceneGraph);
                break;
            case ActionTypes.DELETE_SCENE_GRAPH:
                delete _sceneGraphs[action.sceneGraphId];
                HubClient.deleteSceneGraph(action.sceneGraphId);
                break;
        }

        SceneGraphStore.emitChange();

        return true;
    })
});

module.exports = SceneGraphStore;
