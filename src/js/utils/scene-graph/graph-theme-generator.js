var SceneStore = require('../../stores/scene-store')
var _ = require('lodash');

module.exports = {

    // AP: Giving it an optional param that can be given when used in tests to maintain the correct store ref
    // Due to the actual's function usage in the HubClient it does not make  sense that it should get a scene reference.
    generateGraphThemes: function (sceneGraph, sceneStore = null) {
        //AP: as disscussed this will take into account only one scene and this will be the first scene available
        if (sceneStore) {
            SceneStore = sceneStore;
        }
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
    }
};
