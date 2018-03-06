var SceneStore = require('../../stores/scene-store')
var _ = require('lodash');

module.exports = {
    generateGraphThemes: function (sceneGraph) {
        console.log(sceneGraph)
        //AP: as disscussed this will take into account only one scene and this will be the first scene available
        var sceneKeys = Object.keys(sceneGraph.sceneIds);
        var scene = SceneStore.getScene(sceneKeys[0]);
        if(scene){
            var themeKeys = Object.keys(scene.themes);
            console.log(themeKeys);
            //AP: We are assuming that this is using the structure of a sound graph type as written on 05/March/2018
            var root = sceneGraph.graphThemes.children["SOUNDS"];
            _.each(themeKeys,function(key){
                root.children[key] = {
                    type: 'stheme',
                    children: {}
                }
            })
        }
        console.log("gen",sceneGraph);
        return sceneGraph;
    }
};
