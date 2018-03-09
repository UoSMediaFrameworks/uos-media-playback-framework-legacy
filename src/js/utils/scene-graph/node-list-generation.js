/*jshint browser: true */
'use strict';

var _ = require('lodash');
var SceneStore = require('../../stores/scene-store');
var TagMatcher = require('../tag-matcher');

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
        case 'image':
        case 'video':
        case 'audio':
        case 'text':
            return node.type;
        case 'gtheme':
        case 'subgraphtheme':
            return 'subgraphtheme';
        case 'stheme':
        case 'theme':
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

var createMediaObjectNode = function(id, name, parentIds, childrenIds, type, moTags, moUrl) {
    var node = createNode(id, name, parentIds, childrenIds, type);

    node.tags = moTags;
    node.url = moUrl;

    return node;
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

        // APEP for each scene, if we have a matching theme, we include this scene as a reference to that theme.
        //  this can lead to the same named theme, bringing in too many scenes
        //  this is like this from quick develop for the GDC event.
        //   - We may wish to change this, when a theme is looked up, we probably want to allow a user to avoid duplicate theme names here
        if(sceneThemes.indexOf(sthemeId) !== -1) {
            sceneNameIds.push( { name: scene.name, _id: scene._id, media: scene.scene, themes: scene.themes });
        }
    });

    return sceneNameIds;
};

//TODO can offer non recursive function for large scene graphs
var getChildrenNodes = function(node, nodeObj, sceneGraph) {
    //console.log("NODE",node,nodeObj,sceneGraph);
    var nodeChildren = Object.keys(node.children);

    // APEP (recursive function exit condition) if we have no children to process, map will not run and getChildrenNodes is not called for this branch of recursion.
    // APEP start bubbling back up till the next recursive branch.
    _.map(nodeChildren, function(childProp) {

        var child = node.children[childProp];
        var childObj = createNode(childProp, childProp, [], [], getChildTypeFromNodeType(child));

        // APEP process each childs children (recursive function)
        getChildrenNodes(child, childObj, sceneGraph);

        childObj.parentRelationshipIds.push(nodeObj._id);
         //if stheme attach all duplicate scene leaf nodes - dedupe process will prune these - as scenes are not provided in the document data structure
        if(child.type === "stheme") {

            var sceneNodeData = getSceneNodeListForSTheme(sceneGraph, childProp);
            _.forEach(sceneNodeData, function(sceneNode) {

                var sceneNodeObj = createNode(sceneNode._id, sceneNode.name, [childProp], [], "scene");
                nodeList.push(sceneNodeObj);

                // for all scenes getting added, we can add media objects
                var themeTagMatcher = new TagMatcher(sceneNode.themes[childProp]);
                childObj.themeTags = sceneNode.themes[childProp];
                var matchingMos = _.filter(sceneNode.media, function(mo) {
                    return themeTagMatcher.match(mo.tags);
                });
                _.forEach(matchingMos, function(mo) {
                    var mediaNodeObj = createMediaObjectNode(mo._id, mo._id, [childProp], [], mo.type, mo.tags, mo.url);
                    nodeList.push(mediaNodeObj);
                });
            });
        }

        nodeList.push(childObj);

        return childObj;
    });

    return nodeChildren;
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
        if(child._id === searchChild._id && getChildTypeFromNodeType(child) === searchChild.type)
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
        // APEP we've already dealt with the child if exists in uniqueChildren
        if(countChildrenByChild(child, uniqueChildren) !== 0) {
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

    NODE_TYPES: {
        ROOT_NODE: 'root',
        SCENE_THEME: 'stheme',
    },

    NODE_LIST_TYPES: {
        ROOT_NODE: 'root',
        SCENE_THEME: 'theme'
    },

    //TODO attach the scenes as nodes
    // APEP Optional variable for test environment
    generateNodeListForSceneGraph: function(sceneGraph, sceneStore) {

        if(sceneStore) SceneStore = sceneStore;

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

            //start to recursively iterate through children added them to node list
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
