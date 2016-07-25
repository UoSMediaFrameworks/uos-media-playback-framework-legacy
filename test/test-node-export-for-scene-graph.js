/**
 * Created by aaronphillips on 21/07/2016.
 */

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

var themesUnion = [
    "ThemeWaterFlow",
    "ThemeRain",
    "ThemeFresh",
    "ThemeArt",
    "ThemePainting",
    "ThemePublicAttractions",
    "ThemeGallery",
    "ThemeGreat",
    "ThemeMuseam",
    "ThemeSmog",
    "ThemeIndustry",
    "ThemeDanger",
    "ThemeBusy",
    "ThemeHunger",
    "ThemeFastfood",
    "ThemetFastfood",
    "ThemeTakeaways",
    "ThemeStreetFood",
    "ThemeRoads",
    "ThemeCars"
];

/**
 * Better data set
 * @type {{name: string, sceneIds: {}, graphThemes: {city: {Waterways: {ThemeWaterFlow: {}, ThemeRain: {}, ThemeFresh: {}}, Chicago: {ThemeArt: {ThemePainting: {}, ThemePublicAttractions: {ThemeGallery: {}}}, ThemeGreat: {}, Waterways: {ThemeWaterFlow: {}, ThemeRain: {}, ThemeFresh: {}}}, Manchester: {ThemeArt: {ThemeMuseam: {}}, Waterways: {ThemeWaterFlow: {}, ThemeRain: {}, ThemeFresh: {}}}, Beijing: {ThemeSmog: {}, ThemeIndustry: {ThemeDanger: {}, ThemeBusy: {}}}, Dalian: {}, KualaLumpur: {}, Seoul: {}, Chengdu: {}, HongKong: {}, Shenyang: {}, Panjin: {}}, people: {Poverty: {ThemeHunger: {}, ThemeFastfood: {}}, Chicago: {ThemetFastfood: {}}, Manchester: {ThemeTakeaways: {}}, Beijing: {ThemeStreetFood: {}}, Dalian: {}, KualaLumpur: {}, Seoul: {}, Chengdu: {}, HongKong: {}, Shenyang: {}, Panjin: {}}, movement: {Transport: {ThemeRoads: {ThemeCars: {}}}, Chicago: {Transport: {ThemeRoads: {ThemeCars: {}}}}, Manchester: {Transport: {ThemeRoads: {ThemeCars: {}}}}, Beijing: {Transport: {ThemeRoads: {ThemeCars: {}}}}, Dalian: {}, KualaLumpur: {}, Seoul: {}, Chengdu: {}, HongKong: {}, Shenyang: {}, Panjin: {}}}}}
 */
var sceneGraph = {
    'name': "name of graph",
    'sceneIds': {},
    "graphThemes": {
        "city": {
            "Waterways": {
                "ThemeWaterFlow":{},
                "ThemeRain": {},
                "ThemeFresh": {},
            },
            "Chicago": {
                "ThemeArt": {
                    "ThemePainting": {

                    },
                    "ThemePublicAttractions": {
                        "ThemeGallery": {

                        }
                    }
                },
                "ThemeGreat": {},
                "Waterways": {
                    "ThemeWaterFlow":{},
                    "ThemeRain": {},
                    "ThemeFresh": {},
                }
            },
            "Manchester": {
                "ThemeArt": {
                    "ThemeMuseam": {}
                },
                "Waterways": {
                    "ThemeWaterFlow":{},
                    "ThemeRain": {},
                    "ThemeFresh": {},
                }
            },
            "Beijing": {
                "ThemeSmog": {

                },
                "ThemeIndustry": {
                    "ThemeDanger": {},
                    "ThemeBusy": {}
                }
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
            "Poverty": {
                "ThemeHunger": {},
                "ThemeFastfood": {}
            },
            "Chicago": {
                "ThemetFastfood": {},
            },
            "Manchester": {
                "ThemeTakeaways": {}
            },
            "Beijing": {
                "ThemeStreetFood": {}
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
            "Transport": {
                "ThemeRoads": {
                    "ThemeCars": {}
                }
            },
            "Chicago": {
                "Transport": {
                    "ThemeRoads": {
                        "ThemeCars": {}
                    }
                },
            },
            "Manchester": {
                "Transport": {
                    "ThemeRoads": {
                        "ThemeCars": {}
                    }
                },
            },
            "Beijing": {
                "Transport": {
                    "ThemeRoads": {
                        "ThemeCars": {}
                    }
                },
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
    }
};

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
            if(themesUnion.indexOf(nodeId.toLowerCase()) !== -1) {
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
        childrenRelationshIds: childrenIds
    }
};

/**
 * Ultimately, I want to process the structure depth first
 * Meaning I create the node relationships as I process through the  levels of the tree until each depth has been covered.
 * This strategy should be suitable to reduce stack overflow issues with large structures
 *
 * @type {sceneGraph.graphThemes|{city, people, movement}}
 */
var root = sceneGraph.graphThemes;

/**
 * The first depth level of the structure
 * Create the initial nodes for the list
 * @type {Array}
 */
var rootNodes = Object.keys(root);

var nodeList = [

];


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


_.forEach(rootNodes, function(rootNodeKey){

    //console.log("RootNodeKey: ", rootNodeKey);
    var rootNode = root[rootNodeKey];
    //console.log("RootNodeElement: ", rootNode);

    //create roots node, no parents.. skipping children ids for now
    var node = createNode(rootNodeKey, rootNodeKey, [], [], 'root');
    nodeList.push(node);

    //recursively iterate through children added them to node list
    getChildrenNodes(rootNode, node);
    nodeList = dedupeChildren(nodeList);
});

console.log("==================");
console.log("HERE: ", nodeList);


