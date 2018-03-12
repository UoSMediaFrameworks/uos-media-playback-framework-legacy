'use strict'
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
    "categoryConfig": {"rowHeaders": [], "columnHeaders": [], "themes": []},
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
describe('GraphThemeGenerator', function () {
    describe('generateGraphThemeForSceneGraph', function () {

        before(function () {
            AppDispatcher.handleViewAction({
                type: ActionTypes.SCENE_CHANGE,
                scene: sceneDocument
            });
        });
        it('should have the scene stored in the SceneStore', function () {
            var scene = SceneStore.getScene(sceneDocument._id);
            assert(scene,"scene exists");
        });
        it('should be a scene graph of type SOUND', function () {
            assert(sceneGraph.type === GraphTypes.SOUND,"graph is of the type Sound");
        });
        describe('The graphThemes are generated', function () {
            beforeEach(function () {
                GraphThemeGenerator.generateGraphThemes(sceneGraph);
            });
            it ("graph theme SOUND has children",function(){
                var rootSound = sceneGraph.graphThemes.children["SOUNDS"];
                assert(Object.keys(rootSound.children).length > 0,"graph theme has children")
            })
            it ("graph theme SOUND's children are the correct amount",function(){
                var themeKeys = Object.keys(sceneDocument.themes);
                var graphThemeKeys = Object.keys(sceneGraph.graphThemes.children["SOUNDS"].children);
                assert(themeKeys.length > 0,"the scene has themes");
                assert(graphThemeKeys.length == themeKeys.length, "the graph has the same amount of graph themes, as the scene")
            })
            it ("graph theme SOUND's children are the same order as the scene's themes",function(){
                var themeKeys = Object.keys(sceneDocument.themes);
                _.each(Object.keys(sceneGraph.graphThemes.children["SOUNDS"].children),function(key,index){
                    assert(key === themeKeys[index],"key is the same");
                })
            })
        });

        // APEP TODO test to use a sceneGraph with incorrect type and make sure it doesn't do this auto mapping rule
    })
});
