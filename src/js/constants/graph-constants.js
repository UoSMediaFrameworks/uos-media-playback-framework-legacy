//AP: adding some future proofing if we have some old graphs that have unhandled node or graph type.
module.exports = {
    GraphTypes: {
        "NARM": "NARM_SCENE_GRAPH",
        "GDC": "GDC_SCENE_GRAPH",
        "MEMOIR": "MEMOIR_SCENE_GRAPH",
        "THUMBNAIL": "THUMBNAIL_SCENE_GRAPH",
        "CERAMIC": "CERAMIC_SCENE_GRAPH"
    },
    GraphTitles: {
        "NARM_SCENE_GRAPH": "NARM",
        "GDC_SCENE_GRAPH": "GDC",
        "MEMOIR_SCENE_GRAPH": "MEMOIR",
        "THUMBNAIL_SCENE_GRAPH": "THUMBNAIL",
        "CERAMIC_SCENE_GRAPH": "CERAMIC",
        "undefined":""
    },
    GraphNodeTypes: {
        "ROOT_NODE_TYPE": "root",
        "CITY_NODE_TYPE": "city",
        "GTHEME_NODE_TYPE": "gtheme",
        "CHAPER_NODE_TYPE": "chapter",
        "undefined":"error"
    },
    GraphVersions: {
        "GDC_GRAPH_VERSION": "1.0.0",
        "GRAPH_ALPHA_VERSION": "alpha-1"
    }
};
