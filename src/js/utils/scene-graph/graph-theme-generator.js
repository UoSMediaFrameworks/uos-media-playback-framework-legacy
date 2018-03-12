var SceneStore = require('../../stores/scene-store')
var _ = require('lodash');

module.exports = {

    // APEP TODO refactor generateGraphThemes signature to take a sceneGraph and a scene
    // this would allow us to use a single function and not require the generateThemesForTest as we don't need a SceneStore as a dependency for this utility.

    generateGraphThemes: function (sceneGraph) {
        //AP: as disscussed this will take into account only one scene and this will be the first scene available
        var sceneKeys = Object.keys(sceneGraph.sceneIds);
        var scene = SceneStore.getScene(sceneKeys[0]);
        if (scene) {
            var themeKeys = Object.keys(scene.themes);
            //AP: We are assuming that this is using the structure of a sound graph type as written on 05/March/2018
            var root = sceneGraph.graphThemes.children["SOUNDS"];
            if (Object.keys(root.children).length < 1) {
                _.each(themeKeys, function (key) {
                    root.children[key] = {
                        type: 'stheme',
                        children: {}
                    }
                })
            }


        }
        return sceneGraph;
    },

    generateGraphThemesForTest: function (sceneGraph, sceneStore) {
        //AP: this is for units tests, giving a refference to the scene store used
        var sceneKeys = Object.keys(sceneGraph.sceneIds);
        var scene = sceneStore.getScene(sceneKeys[0]);
        if (scene) {
            var themeKeys = Object.keys(scene.themes);
            //AP: We are assuming that this is using the structure of a sound graph type as written on 05/March/2018
            var root = sceneGraph.graphThemes.children["SOUNDS"];
            if (Object.keys(root.children).length < 1) {
                _.each(themeKeys, function (key) {
                    root.children[key] = {
                        type: 'stheme',
                        children: {}
                    }
                })
            }


        }
        return sceneGraph;
    }
};
