
module.exports = {
    ComponentTypes: {
        "SceneList": "Scene-List",
        "SceneGraphList": "Scene-Graph-List",
        "SceneGraph": "Scene-Graph",
        "Graph": "Graph",
        "SceneViewer": "Scene-Viewer",
        "GraphViewer": "Graph-Viewer",
        "SceneEditor": "Scene-Editor",
        "SceneMediaBrowser": "Scene-Media-Browser",
        "SceneEditorGUI": "Scene-Editor-GUI",
        "TagEditor": "Tag-Editor",
        "MediaUpload": "Media-Upload"
    },
    ComponentTitles:{
        "Scene-List":"Scene List",
        "Scene-Graph-List": "Scene Graph List",
        "Scene-Graph": "Scene Graph Editor",
        "Graph" : "Graph",
        "Scene-Viewer":"Scene Preview Player",
        "Graph-Viewer":"External Player",
        "Scene-Editor":"Scene Editor",
        "Scene-Media-Browser":"Scene Media Browser",
        "Scene-Editor-GUI":"Visual Scene Editor",
        "Tag-Editor": "Tag Editor",
        "Media-Upload":"Media Upload"
    },
    ColumnTypes: {
        "RHS": "RightHandSide",
        "LHS": "LeftHandSide"
    },
    ComponentTypesForPopout: {
        "Graph": "Graph",
        "Graph-Viewer": "Graph-Viewer"
    },
    ComponentTypesForPresentation: {
        "Graph": "Graph",
        "Graph-Viewer": "Graph-Viewer"
    },
    PresetLayouts: {
        "default": [
            {"x":0,"y":13,"w":9,"h":9,"_w":9,"_h":9,"type":"Tag-Editor","visible":true,"isResizable":true,"state":"default","moved":false,"static":false},
            {"x":0,"y":0,"w":9,"h":13,"_w":9,"_h":13,"type":"Scene-Media-Browser","visible":true,"isResizable":true,"state":"default","moved":false,"static":false},
            {"x":9,"y":0,"w":12,"h":12,"_w":12,"_h":12,"type":"Scene-Editor-GUI","visible":true,"isResizable":true,"state":"default","moved":false,"static":false},
            {"x":9,"y":12,"w":21,"h":14,"_w":21,"_h":14,"type":"Scene-Editor","visible":true,"isResizable":true,"state":"default","moved":false,"static":false},
            {"x":21,"y":0,"w":9,"h":5,"_w":9,"_h":5,"type":"Media-Upload","visible":true,"isResizable":true,"state":"default","moved":false,"static":false},
            {"x":21,"y":5,"w":9,"h":7,"_w":9,"_h":7,"type":"Scene-Viewer","visible":true,"isResizable":true,"state":"default","moved":false,"static":false}
        ]
    }
};
