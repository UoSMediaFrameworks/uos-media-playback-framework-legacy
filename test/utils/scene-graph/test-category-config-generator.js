'use strict';
var CategoryConfigGenerator = require('../src/js/utils/scene-graph/category-config-generator');
var assert = require('chai').assert;
var _ = require('lodash');
var SceneStore = require('../src/js/stores/scene-store');
var sceneGraph = {

};
describe('CategoryConfigGenerator', function() {
    describe('generateNodeListForSceneGraph', function() {

        before(function() {
            AppDispatcher.handleViewAction({
                type: ActionTypes.SCENE_CHANGE,
                scene: sceneDocument
            });
        });
    })
})
