/*jshint browser: true */
'use strict';

var _ = require('lodash');

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
    }
};

var createNode = function(id, name, parentIds, childrenIds, type) {
    return {
        _id: id,
        name: name,
        type: type,
        parentRelationshipIds: parentIds,
        childrenRelationshipIds: childrenIds
    }
};


//TODO can offer non recursive function for large scene graphs
var getChildrenNodes = function(node, nodeObj) {
    // console.log("getChildrenNodes: ", {node: node, nodeObj: nodeObj});

    var rootNodeChildren = Object.keys(node);

    _.map(rootNodeChildren, function(childProp) {
        var child = node[childProp];
        var childObj = createNode(childProp, childProp, [], [], getChildTypeFromParentType(nodeObj.type, childProp));
        var childrenNodes = getChildrenNodes(child, childObj);
        childObj.parentRelationshipIds.push(nodeObj._id);

        // console.log("childObj: ", childObj);

        nodeList.push(childObj);

        return childObj;
    });

    return rootNodeChildren;
};

var findChildrenByChild = function(searchChild, children) {
    var duplicateChildren = [];

    _.forEach(children, function(child) {
        if(child._id === searchChild._id)
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

module.exports = {
    generateNodeListForSceneGraph: function(sceneGraph) {

        var root = sceneGraph.graphThemes;

        /**
         * The first depth level of the structure
         * Create the initial nodes for the list
         * @type {Array}
         */
        var rootNodes = Object.keys(root);

        nodeList = [];

        _.forEach(rootNodes, function(rootNodeKey){
            var rootNode = root[rootNodeKey];

            //create roots node, no parents.. skipping children ids for now
            var node = createNode(rootNodeKey, rootNodeKey, [], [], 'root');
            nodeList.push(node);

            //recursively iterate through children added them to node list
            getChildrenNodes(rootNode, node);
            nodeList = dedupeChildren(nodeList);
        });

        sceneGraph.nodeList = nodeList;
    }
};
