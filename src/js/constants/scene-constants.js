var keymirror = require('keymirror');

module.exports = {
    ActionTypes: keymirror({
        SCENE_CHANGE: null,
        DELETE_SCENE: null,
        ADD_MEDIA_OBJECT: null,
        ADD_MEDIA_ATTEMPT: null,
        ADD_MEDIA_SUCCESS: null,
        ADD_MEDIA_FAILED: null,
        REMOVE_MEDIA_OBJECT: null,
        LIST_SCENES_ATTEMPT: null,
        RECIEVE_SCENE_LIST: null,
        RECIEVE_SCENE: null,
        RECEIVE_SCENE_GRAPH_LIST: null,
        RECEIVE_SCENE_GRAPH: null,
        HUB_LOGIN_ATTEMPT: null,
        HUB_LOGIN_RESULT: null,
        HUB_LOGOUT: null,
        UPLOAD_ASSET: null,
        UPLOAD_ASSET_RESULT: null,
        UPLOAD_ASSET_RESULT_REMOVE: null,
        STATUS_MESSAGE: null,
        STATUS_MESSAGE_UPDATE: null,
        STATUS_MESSAGE_REMOVE: null,
        
        /* APEP Full Scene (v1.5 Scene with V2 Objects appended */
        RECIEVE_FULL_SCENE: null,

        /* APEP Scene Graph Document Authoring */
        SCENE_GRAPH_UPDATE: null,
        SCENE_GRAPH_ADD_SCENE: null,
        SCENE_GRAPH_REMOVE_SCENE: null,
        SCENE_GRAPH_SELECTION: null,
        SCENE_GRAPH_EXCLUDE_THEME: null,
        SCENE_GRAPH_INCLUDE_THEME: null,
        SCENE_GRAPH_ADD_THEME_TO_STRUCTURE: null,
        SCENE_GRAPH_REMOVE_THEME_FROM_STRUCTURE: null,
        DELETE_SCENE_GRAPH: null,
        /*Angel P. Video Store events*/
        GET_TRANSCODED_STATUS_ATTEMPT:null,
        GET_TRANSCODED_STATUS_FAILURE:null,
        GET_TRANSCODED_STATUS_SUCCESS:null,

        DELETE_SCENE_GRAPH: null,
        /* APEP Scene Graph Viewer */
        RECEIVE_SCENES_FROM_GRAPH: null
    }),
    PayloadSources: keymirror({
        VIEW_ACTION: null,
        HUB_ACTION: null
    })
};
