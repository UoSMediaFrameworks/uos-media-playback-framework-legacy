var keymirror = require('keymirror');

module.exports = {
    GraphTypes: keymirror({
        GDC_SCENE_GRAPH: null,
        MEMOIR_SCENE_GRAPH: null,
        NARM_SCENE_GRAPH: null,
        SALFORD_PRESS_GRAPH: null
    }),
    NodeTypes: {
        ROOT_NODE_TYPE: "root",
        CITY_NODE_TYPE: "city",
        GTHEME_NODE_TYPE: "gtheme",
        CHAPER_NODE_TYPE: "chapter"
    },
    GraphVersions: {
        GDC_GRAPH_VERSION: "1.0.0",
        GRAPH_ALPHA_VERSION: "alpha-1"
    }
};
