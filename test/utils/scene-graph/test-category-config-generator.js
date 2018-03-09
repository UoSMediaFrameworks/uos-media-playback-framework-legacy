'use strict';
var CategoryConfigGenerator = require('../../../src/js/utils/scene-graph/category-config-generator');
var NodeListGenerator = require('../../../src/js/utils/scene-graph/node-list-generation');
var GraphThemeGenerator = require('../../../src/js/utils/scene-graph/graph-theme-generator');
var assert = require('chai').assert;
var _ = require('lodash');
var GraphTypes = require('../../../src/js/constants/graph-constants').GraphTypes;
var SceneStore = require('../../../src/js/stores/scene-store');
var AppDispatcher = require('../../../src/js/dispatchers/app-dispatcher');
var ActionTypes = require('../../../src/js/constants/scene-constants').ActionTypes;

var sceneDocument = {
    "_id": "5a9fc09c0aea86140900d31d",
    "name": "AP_BEACH_FRONT_SOUNDS",
    "version": "0.1",
    "maximumOnScreen": {
        "image": 3,
        "text": 1,
        "video": 1,
        "audio": 20
    },
    "displayDuration": 10,
    "displayInterval": 1,
    "transitionDuration": 1.4,
    "themes": {
        "Fire": "nature AND fire",
        "Waves": "nature AND water",
        "Walking on sand": "nature AND earth",
        "Dolphins": "animal AND water",
        "Seaguls": "animal AND wind",
        "Breeze": "gray AND test"
    },
    "style": {
        "backgroundColor": "black"
    },
    "scene": [
        {
            "tags": "animal,wind",
            "type": "audio",
            "url": "https://devuosassetstore.blob.core.windows.net/assetstoredev/audio/raw/5a8c1c6caef6c60e24ad166a/flock-of-seagulls_daniel-simion.mp3",
            "style": {
                "z-index": "1"
            },
            "_id": "5a8c1c6d7ecfdb3c0e0f8c8a"
        },
        {
            "tags": "nature,fire",
            "type": "audio",
            "url": "https://devuosassetstore.blob.core.windows.net/assetstoredev/audio/raw/5a8c292faef6c60e24ad166c/forest_fire.mp3",
            "style": {
                "z-index": "1"
            },
            "_id": "5a8c29307ecfdb3c0e0f8cba"
        },
        {
            "tags": "nature,earth",
            "type": "audio",
            "url": "https://devuosassetstore.blob.core.windows.net/assetstoredev/audio/raw/5a8c292faef6c60e24ad166d/Walking On Gravel-SoundBible.com-2023303198.mp3",
            "style": {
                "z-index": "1"
            },
            "_id": "5a8c29307ecfdb3c0e0f8cbb"
        },
        {
            "tags": "nature,wind",
            "type": "audio",
            "url": "https://devuosassetstore.blob.core.windows.net/assetstoredev/audio/raw/5a8c2930aef6c60e24ad166e/wind-breeze-01.mp3",
            "style": {
                "z-index": "1"
            },
            "_id": "5a8c29307ecfdb3c0e0f8cbf"
        },
        {
            "tags": "nature,water",
            "type": "audio",
            "url": "https://devuosassetstore.blob.core.windows.net/assetstoredev/audio/raw/5a8c2972aef6c60e24ad166f/wavebig.mp3",
            "style": {
                "z-index": "1"
            },
            "_id": "5a8c29737ecfdb3c0e0f8cc0"
        },
        {
            "tags": "animal,water",
            "type": "audio",
            "url": "https://devuosassetstore.blob.core.windows.net/assetstoredev/audio/raw/5a8c2994aef6c60e24ad1670/Dolphins-SoundBible.com-1774583018.mp3",
            "style": {
                "z-index": "1"
            },
            "_id": "5a8c29957ecfdb3c0e0f8cc1"
        }
    ],
    "$schema": "http://sound-board-gui-demo-uos-sceneeditor.eu-west-1.elasticbeanstalk.com/schemas/scene-schema.json"
};
var sceneGraph = {
    "_id": "5a9fc0dc0aea86140900d320",
    "categoryConfig": {"rowHeaders": [], "columnHeaders": [], "dimensionConfig": {"maxRows": null, "maxColumns": null}},
    "name": "SceneGraphForTest",
    "sceneIds": {"5a9fc09c0aea86140900d31d": "5a9fc09c0aea86140900d31d"},
    "type": "SOUND_GUI",
    "version": "alpha-1",
    "graphThemes": {"type": "document", "children": {"SOUNDS": {"type": "root", "children": {}}}},
    "excludedThemes": {},
    "nodeList": [{
        "_id": "SOUNDS",
        "name": "SOUNDS",
        "type": "root",
        "parentRelationshipIds": [],
        "childrenRelationshipIds": []
    }]
};
describe('CategoryConfigGenerator', function () {
    describe('generateNodeListForSceneGraph', function () {

        before(function () {
            AppDispatcher.handleViewAction({
                type: ActionTypes.SCENE_CHANGE,
                scene: sceneDocument
            });
        });
        it('should have the scene stored in the SceneStore', function () {
            var scene = SceneStore.getScene(sceneDocument._id);
            assert(scene, "scene exists");
        });
        it('should be a scene graph of type SOUND', function () {
            assert(sceneGraph.type === GraphTypes.SOUND, "graph is of the type Sound");
        });
        it('should be an empty category config', function () {
            assert(sceneGraph.categoryConfig.rowHeaders = [], "the category config has no row headers");
            assert(sceneGraph.categoryConfig.columnHeaders = [], "the category config has no column headers");
        });
        describe('The category config is generated', function () {
            beforeEach(function () {
                //Using the graph theme generator to generate some themes
                GraphThemeGenerator.generateGraphThemesForTest(sceneGraph, SceneStore);
                //THe current category config bases its data generation on the node list
                NodeListGenerator.generateNodeListForSceneGraph(sceneGraph, SceneStore);
                CategoryConfigGenerator.generateCategoryConfig(sceneGraph);
            });
            it("scene graph has node list ", function () {
                assert(sceneGraph.nodeList.length > 0, "graph theme has children")
            });
            it("should category have a config list with generated information", function () {
                assert(sceneGraph.categoryConfig.rowHeaders.length > 0, "the category config has no row headers");
                assert(sceneGraph.categoryConfig.columnHeaders.length > 0, "the category config has no column headers");
            });

            //a test that shows that aliases are kept if data is chaged
            //a test that shows that the rows and columns generated are lower or equal to the amount specified
        });

        describe('testing category config with dimension data', function () {

            it("should contain max dimension config", function () {
                assert(sceneGraph.categoryConfig.dimensionConfig, "the dimension config exists")

            });
            it("should not contain the existing max dimensions config", function () {
                console.log(sceneGraph.categoryConfig.dimensionConfig)
                assert(!sceneGraph.categoryConfig.dimensionConfig.maxRows, "max rows does not exist");
                assert(!sceneGraph.categoryConfig.dimensionConfig.maxColumns, "max columns does not exist")
            });



        });
        describe('testing generated data with dimension data', function () {

            beforeEach(function () {
                //Using the graph theme generator to generate some themes
                sceneGraph.categoryConfig.dimensionConfig = {maxRows: 2, maxColumns: 3};
                GraphThemeGenerator.generateGraphThemesForTest(sceneGraph, SceneStore);
                //THe current category config bases its data generation on the node list
                NodeListGenerator.generateNodeListForSceneGraph(sceneGraph, SceneStore);
                CategoryConfigGenerator.generateCategoryConfig(sceneGraph);
            });
            it("scene graph has node list ", function () {
                assert(sceneGraph.nodeList.length > 0, "graph theme has children")
            });
            it("should category have a config list with generated information", function () {
                assert(sceneGraph.categoryConfig.rowHeaders.length > 0, "the category config has no row headers");
                assert(sceneGraph.categoryConfig.columnHeaders.length > 0, "the category config has no column headers");
            });
            it("should contain the existing max dimensions config", function () {
                assert(sceneGraph.categoryConfig.dimensionConfig.maxRows, "max rows exist");
                assert(sceneGraph.categoryConfig.dimensionConfig.maxColumns, "max columns exist")
            });
            it("should category have a config list with generated information", function () {
                assert(sceneGraph.categoryConfig.rowHeaders.length <= sceneGraph.categoryConfig.dimensionConfig.maxRows, "row headers generated are withing bounds");
                assert(sceneGraph.categoryConfig.columnHeaders.length <= sceneGraph.categoryConfig.dimensionConfig.maxColumns, " column headers generated within bounds");
            });


        });
    })
})
;
