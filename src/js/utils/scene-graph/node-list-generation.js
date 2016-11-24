/*jshint browser: true */
'use strict';

var _ = require('lodash');
var SceneStore = require('../../stores/scene-store');

var cities = [
    "beijing",
    "chicago",
    "dalian",
    "kualalumpur",
    "manchester",
    "seoul",
    "chengdu",
    "hongkong",
    "shenyang",
    "panjin"
];

var graphThemes = [
    "TransportationSystem",
    "EthnicDance",
    "NightMarket",
    "GreenInitiative",
    "Changes",
    "Technology",
    "Entertainment",
    "Tradition",
    "Intimacy",
    "History",
    "FoodDiversity",
    "Diversity",
    "Nature",
    "Politics",
    "Place",
    "Signage",
    "Archaeology",
    "Climate",
    "Commute",
    "FusionOfCultures",
    "Conflict",
    "Waterways",
    "Sports",
    "Culture",
    "PaceOfTime",
    "Art",
    "FoodFusion",
    "Student",
    "Language",
    "WorkingClass",
    "Generation",
    "Migration",
    "Personality",
    "Progress",
    "Nightlife",
    "Lively",
    "Performance",
    "Transit",
    "Tour",
];

/**
 * Calculates the type for the new child node, using the parent type and child node id
 * @param parentType
 * @param nodeId
 * @returns {*}
 */
var getChildTypeFromParentType = function(parentType, nodeId) {
    switch(parentType) {
        case 'root':
            if(cities.indexOf(nodeId.toLowerCase()) !== -1) {
                return 'city';
            } else {
                return 'subgraphtheme'
            }
        case 'city':
            if(graphThemes.indexOf(nodeId) !== -1) {
                return 'theme';
            } else {
                return 'subgraphtheme'
            }
        case 'theme':
            return 'theme';
        case 'subgraphtheme':
            return 'theme';
        case 'scene':
            return 'scene';
    }
};

/**
 * Parses the node instance to return type for graph naming type
 *  TODO: Update D3 graph to use same node types and this process is not required
 * @param node
 * @returns {*}
 */
var getChildTypeFromNodeType = function(node) {
    switch(node.type) {
        case 'root':
        case 'city':
        case 'scene':
        case 'chapter':
            return node.type;
        case 'gtheme':
            return 'subgraphtheme';
        case 'stheme':
            return 'theme';
    }
};

/**
 * Simple node instance creation
 * @param id
 * @param name
 * @param parentIds
 * @param childrenIds
 * @param type
 * @returns {{_id: *, name: *, type: *, parentRelationshipIds: *, childrenRelationshipIds: *}}
 */
var createNode = function(id, name, parentIds, childrenIds, type) {
    return {
        _id: id,
        name: name,
        type: type,
        parentRelationshipIds: parentIds,
        childrenRelationshipIds: childrenIds
    }
};

/**
 * Generates the list of scene name and id objects for each scene within the scene graph that features the given stheme
 * @param sceneGraph
 * @param sthemeId
 * @returns {Array}
 */
var getSceneNodeListForSTheme = function(sceneGraph, sthemeId) {

    var sceneNameIds = [];

    _.forEach(Object.keys(sceneGraph.sceneIds), function(id){
        var sceneId = sceneGraph.sceneIds[id];

        var scene = SceneStore.getScene(sceneId);

        var sceneThemes = Object.keys(scene.themes);

        if(sceneThemes.indexOf(sthemeId) !== -1) {
            sceneNameIds.push( { name: scene.name, _id: scene._id });
        }
    });

    return sceneNameIds;
};

//TODO can offer non recursive function for large scene graphs
var getChildrenNodes = function(node, nodeObj, sceneGraph) {

    var rootNodeChildren = Object.keys(node.children);

    _.map(rootNodeChildren, function(childProp) {
        var child = node.children[childProp];
        var childObj = createNode(childProp, childProp, [], [], getChildTypeFromNodeType(child));
        var childrenNodes = getChildrenNodes(child, childObj, sceneGraph);
        childObj.parentRelationshipIds.push(nodeObj._id);

        if(child.type === "stheme") { //if stheme attach all duplicate scene leaf nodes - dedupe process will prune these - as scenes are not provided in the document data structure
            var sceneNodeData = getSceneNodeListForSTheme(sceneGraph, childProp);
            _.forEach(sceneNodeData, function(sceneNode) {
                var sceneNodeObj = createNode(sceneNode._id, sceneNode.name, [childProp], [], "scene");
                nodeList.push(sceneNodeObj);
            });
        }

        nodeList.push(childObj);

        return childObj;
    });

    return rootNodeChildren;
};

/**
 * Resolve a list of duplicate chlidren within a nodes children
 * @param searchChild
 * @param children
 * @returns {Array}
 */
var findChildrenByChild = function(searchChild, children) {
    var duplicateChildren = [];

    _.forEach(children, function(child) {

        if(child._id === searchChild._id &&  getChildTypeFromNodeType(child.type) === searchChild.type)
            duplicateChildren.push(child);
    });

    return duplicateChildren;
};

var countChildrenByChild = function (child, children) {
    return findChildrenByChild(child, children).length
};

var dedupeChildren = function(children) {
    var uniqueChildren = [];

    _.forEach(children, function(child) {
        if(countChildrenByChild(child, uniqueChildren)) {
            return;
        }

        if(countChildrenByChild(child, children) <= 1) {
            uniqueChildren.push(child);
            return;
        }

        var duplicates = findChildrenByChild(child, children);

        var duplicateParentRelationshipIds = [];

        _.forEach(duplicates, function(duplicate){
            duplicateParentRelationshipIds.push(duplicate.parentRelationshipIds);
        });

        var mergedDuplicatesRelationshipIds =_.union.apply(this, duplicateParentRelationshipIds);

        var uniqueNode = duplicates[0];

        uniqueNode.parentRelationshipIds = mergedDuplicatesRelationshipIds;

        uniqueChildren.push(uniqueNode);
    });

    return uniqueChildren;
};

var nodeList = [

];

var getRootChildrenForSceneGraphType = function(sceneGraphType) {

    if(sceneGraphType === "MEMOIR_SCENE_GRAPH") {
        //APEP: Hardcoded root node children for memoir graph, this is not strictly necessary as we only use parent relationships in D3 graphs
        return [
            "Chapter1",
            "Chapter2",
            "Chapter3",
            "Chapter4",
            "Chapter5",
            "Chapter6",
            "Chapter7",
            "Chapter8",
            "Chapter9",
            "Chapter10",
            "Chapter11",
            "Chapter12"
        ]
    }

    return []; //APEP: Default empty children
};

module.exports = {

    //TODO attach the scenes as nodes
    generateNodeListForSceneGraph: function(sceneGraph) {

        var root = sceneGraph.graphThemes;

        /**
         * The first depth level of the structure
         * Create the initial nodes for the list
         * @type {Array}
         */
        var rootNodes = Object.keys(root.children);

        nodeList = [];


        _.forEach(rootNodes, function(rootNodeKey){
            var rootNode = root.children[rootNodeKey];

            //create roots node, no parents.. skipping children ids for now
            var node = createNode(rootNodeKey, rootNodeKey, [], getRootChildrenForSceneGraphType(sceneGraph.type), 'root');

            nodeList.push(node);

            //recursively iterate through children added them to node list
            getChildrenNodes(rootNode, node, sceneGraph);
            nodeList = dedupeChildren(nodeList);
        });

        sceneGraph.nodeList = nodeList;
    },

    // generateNodeListForSceneGraphs: function(sceneGraphs) {
    //     _.forEach(sceneGraphs, function(sceneGraph){
    //         this.generateNodeListForSceneGraph(sceneGraph);
    //     }, this);
    //
    //
    //     var fullNodeList = [];
    //
    //
    //     _.forEach(sceneGraphs, function(sceneGraph){
    //
    //         _.forEach(sceneGraph.nodeList, function(node){
    //             fullNodeList.push(node);
    //         });
    //
    //     }, this);
    //
    //     var dedupedFullNodeList = dedupeChildren(fullNodeList);
    //
    //     console.log("dedupedFullNodeList: ", dedupedFullNodeList);
    //
    // }
};
