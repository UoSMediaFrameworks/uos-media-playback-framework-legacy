'use strict';

var _ = require('lodash');
_.mixin(require('lodash-deep'));
var assert = require('chai').assert;
var chance = require('chance').Chance();

var SceneStore = require('../src/js/stores/scene-store');
var NodeListGenerator = require('../src/js/utils/scene-graph/node-list-generation');
var AppDispatcher = require('../src/js/dispatchers/app-dispatcher');
var ActionTypes = require('../src/js/constants/scene-constants').ActionTypes;
var TagMatcher = require('../src/js/utils/tag-matcher');

var sceneDocument = {
    "_id" : "5a13043770e458ac5bc8d6cd",
    "name" : "Textile-Test",
    "version" : "0.1",
    "maximumOnScreen" : {
        "image" : 3,
        "text" : 1,
        "video" : 1,
        "audio" : 1
    },
    "displayDuration" : 10,
    "displayInterval" : 3,
    "transitionDuration" : 1.4,
    "themes" : {
        "Blue colour" : "blue",
        "Red colour" : "red",
        "Yellow colour" : "yellow",
        "Orange colour" : "orange",
        "Multi colour" : "multi",
        "Green colour" : "green",
        "Purple colour" : "purple",
        "Sun colour" : "red, yellow, orange"
    },
    "style" : {
        "backgroundColor" : "black"
    },
    "scene" : [
        {
            "tags" : "red,thumbnail",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336147d0a1450ec97a8a3/red3.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133614f428b684c94067c4"
        },
        {
            "tags" : "red",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336607d0a1450ec97a8a5/red2.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133660f428b684c94067c6"
        },
        {
            "tags" : "",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336607d0a1450ec97a8a4/red1.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133660f428b684c94067c7"
        },
        {
            "tags" : "yellow",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336617d0a1450ec97a8a6/yellow2.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133662f428b684c94067c9"
        },
        {
            "tags" : "yellow,thumbnail",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336617d0a1450ec97a8a7/yellow1.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133662f428b684c94067ca"
        },
        {
            "tags" : "yellow",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336627d0a1450ec97a8a8/yellow3.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133662f428b684c94067cb"
        },
        {
            "tags" : "multi,thumbnail",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336637d0a1450ec97a8a9/2.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133665f428b684c94067cf"
        },
        {
            "tags" : "",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336647d0a1450ec97a8aa/1.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133665f428b684c94067d0"
        },
        {
            "tags" : "multi",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336647d0a1450ec97a8ab/3.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133665f428b684c94067d1"
        },
        {
            "tags" : "multi",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336657d0a1450ec97a8ac/5.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133667f428b684c94067d3"
        },
        {
            "tags" : "multi",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336657d0a1450ec97a8ad/4.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133667f428b684c94067d4"
        },
        {
            "tags" : "multi",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336677d0a1450ec97a8ae/6.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133667f428b684c94067d5"
        },
        {
            "tags" : "",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336677d0a1450ec97a8af/7.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133668f428b684c94067d6"
        },
        {
            "tags" : "",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336687d0a1450ec97a8b0/8.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133669f428b684c94067d7"
        },
        {
            "tags" : "blue,thumbnail",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a1336687d0a1450ec97a8b1/blue1.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a133669f428b684c94067d8"
        },
        {
            "tags" : "blue",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a13366a7d0a1450ec97a8b2/blue3.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a13366af428b684c94067d9"
        },
        {
            "tags" : "blue",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a13366a7d0a1450ec97a8b3/blue2.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a13366bf428b684c94067da"
        },
        {
            "tags" : "orange",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a13366b7d0a1450ec97a8b4/orange1.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a13366bf428b684c94067db"
        },
        {
            "tags" : "orange",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a13366b7d0a1450ec97a8b5/orange2.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a13366cf428b684c94067dc"
        },
        {
            "tags" : "orange,thumbnail",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a13366c7d0a1450ec97a8b6/orange3.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a13366cf428b684c94067dd"
        },
        {
            "tags" : "purple",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a13368d7d0a1450ec97a8b7/purple.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a13368df428b684c94067de"
        },
        {
            "tags" : "purple",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cf55e3bf7a64091755c9/purple2.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cf57e2af13841c7ad4fa"
        },
        {
            "tags" : "purple,thumbnail",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cf55e3bf7a64091755ca/purple1.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cf57e2af13841c7ad4fb"
        },
        {
            "tags" : "purple",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cf58e3bf7a64091755cb/purple4.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cf59e2af13841c7ad4fd"
        },
        {
            "tags" : "purple",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cf58e3bf7a64091755cc/purple3.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cf59e2af13841c7ad4fe"
        },
        {
            "tags" : "green,thumbnail",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cff4e3bf7a64091755ce/green2.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cff5e2af13841c7ad500"
        },
        {
            "tags" : "green",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cff4e3bf7a64091755cd/green1.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cff5e2af13841c7ad501"
        },
        {
            "tags" : "green",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cff5e3bf7a64091755cf/green3.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cff6e2af13841c7ad503"
        },
        {
            "tags" : "green",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cff6e3bf7a64091755d0/green4.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cff6e2af13841c7ad504"
        },
        {
            "tags" : "green",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/5a15cff7e3bf7a64091755d1/green5.jpg",
            "style" : {
                "z-index" : "1"
            },
            "_id" : "5a15cff7e2af13841c7ad505"
        }
    ],
    "_groupID" : 0
}
var graphDocument = {
    "_id" : "5a15eaac11158fd8196d5838",
    "name" : "THUMB2",
    "sceneIds" : {
        "5a13043770e458ac5bc8d6cd" : "5a13043770e458ac5bc8d6cd"
    },
    "type" : "THUMBNAIL_SCENE_GRAPH",
    "version" : "alpha-1",
    "graphThemes" : {
        "type" : "document",
        "children" : {
            "Textiles" : {
                "type" : "root",
                "children" : {
                    "Blue colour" : {
                        "type" : "stheme",
                        "children" : {}
                    },
                    "Yellow colour" : {
                        "type" : "stheme",
                        "children" : {}
                    },
                    "Multi colour" : {
                        "type" : "stheme",
                        "children" : {}
                    },
                    "Purple colour" : {
                        "type" : "stheme",
                        "children" : {}
                    },
                    "Red colour" : {
                        "type" : "stheme",
                        "children" : {}
                    },
                    "Orange colour" : {
                        "type" : "stheme",
                        "children" : {}
                    },
                    "Green colour" : {
                        "type" : "stheme",
                        "children" : {}
                    }
                }
            }
        }
    },
    "excludedThemes" : {},
    "nodeList" : [
    ]
};

describe('NodeListGeneration', function() {

    describe('generateNodeListForSceneGraph', function() {

        before(function() {
            AppDispatcher.handleViewAction({
                type: ActionTypes.SCENE_CHANGE,
                scene: sceneDocument
            });
        });

        it('should have the scene stored in the SceneStore', function() {
            var scene = SceneStore.getScene(sceneDocument._id);
            assert(scene);
        });

        describe('The nodeList is generated', function() {
            before(function() {
               NodeListGenerator.generateNodeListForSceneGraph(graphDocument, SceneStore);

               this.rootNodes = _.filter(graphDocument.nodeList, function(node){
                    return node.type === NodeListGenerator.NODE_LIST_TYPES.ROOT_NODE;
                });
            });

            it('node list has items', function() {
               assert(graphDocument.nodeList.length > 0);
            });

            it('node list has a single root node', function() {
               assert(this.rootNodes.length === 1);
            });

            it('node list has N themes, where N = the number of themes mapped to the roots', function() {
                var numberOfThemeNodes = 0;

                _.forEach(Object.keys(graphDocument.graphThemes.children), function(rootNameKey) {
                   numberOfThemeNodes += _.filter(graphDocument.graphThemes.children[rootNameKey].children, function(child){
                       return child.type === NodeListGenerator.NODE_TYPES.SCENE_THEME;
                   }).length;
                });

                // APEP as we are using a hardcoded set of data, we can assert this number is correct
                assert(numberOfThemeNodes === 7);

                this.sceneThemeNodes = _.filter(graphDocument.nodeList, function(node){
                    return node.type === NodeListGenerator.NODE_LIST_TYPES.SCENE_THEME;
                });

                assert.equal(this.sceneThemeNodes.length, numberOfThemeNodes);
            });

            it('theme nodes all have their respective root', function() {
                _.forEach(this.sceneThemeNodes, function(sceneThemeNode) {
                    assert(sceneThemeNode.parentRelationshipIds.indexOf(this.rootNodes[0]._id) !== -1);
                }.bind(this))
            });

            // APEP TODO we can programatically make these sets of tests easily, lets do it to avoid typeytypey
            // Programatically so all mo types checked.
            it('contains all the media objects as nodes from the scenes within the graph', function() {
                var tagMatchers = _.map(Object.keys(sceneDocument.themes), function(themeKey){
                    return new TagMatcher(sceneDocument.themes[themeKey]);
                });

                var imageMediaObjects = _.filter(sceneDocument.scene, function(mo) {
                    var isCorrectType = mo.type === "image";
                    var matchesOn = _.filter(tagMatchers, function(tagMatcher){
                        return tagMatcher.match(mo.tags);
                    });
                    return isCorrectType && matchesOn.length > 0;
                });

                // var videoMediaObjects = _.filter(sceneDocument.scene, function(mo) {
                //     return mo.type === "video";
                // });
                // var textMediaObjects = _.filter(sceneDocument.scene, function(mo) {
                //     return mo.type === "text";
                // });
                // var audioMediaObjects = _.filter(sceneDocument.scene, function(mo) {
                //     return mo.type === "audio";
                // });

                this.mediaObjectNodes = _.filter(graphDocument.nodeList, function(node) {
                    return node.type === "image";
                });

                assert.equal(imageMediaObjects.length, this.mediaObjectNodes.length);
            });

            it('a media object node should include tags and url field is possible', function() {
                var mediaObjectNode = this.mediaObjectNodes[0];
                assert(mediaObjectNode.tags);
                assert(mediaObjectNode.url);
            });

            it('each media object node should only reference the matching themes parent', function() {
                var mediaObjectNode = this.mediaObjectNodes[0];

                var mediaObjectInScene = _.find(sceneDocument.scene, function(mo) {
                    return mo._id === mediaObjectNode._id;
                }.bind(this));

                assert(mediaObjectInScene);

                var parentThemes = _.map(mediaObjectNode.parentRelationshipIds, function(parent) {
                   return sceneDocument.themes[parent];
                });

                assert(parentThemes.length !== 0);

                _.forEach(parentThemes, function(parentTheme) {
                    var tagMatch = new TagMatcher(parentTheme);

                    assert(tagMatch.match(mediaObjectInScene.tags), "An incorrect parent relationship exists");
                });
            });
        });
    });
});
