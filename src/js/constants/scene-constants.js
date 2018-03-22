var keymirror = require('keymirror');

module.exports = {
    ActionTypes: keymirror({

        /* Grid or Application Layout  */
        COMP_MIN: null,
        COMP_MAX: null,
        COMP_COLLAPSE_LEFT:null,
        COMP_COLLAPSE_RIGHT:null,
        COMP_EXPAND_LEFT:null,
        COMP_EXPAND_RIGHT:null,
        COMP_RESTORE:null,
        COMP_SWITCH_MODE:null,
        COMP_FOCUS_SWITCH:null,
        COMP_POPOUT:null,
        COMP_MEDIA_OBJECT_FOCUS_SWITCH:null,
        GRID_CONTAINER_UPDATE: null, // APEP allow us to track and store some DOM related properties for the layout manager
        ADD_COMPONENT:null,
        REMOVE_COMPONENT:null,
        LAYOUT_CHANGE:null,
        LAYOUT_PRESET_SELECTED: null,

        /*Graph*/
        AUTOCOMPLETE_SELECTED_UPDATE:null,
        /*Breadrumbs*/
        BREADCRUMBS_CLEAR_ALL:null,
        BREADCRUMBS_PLAY:null,
        BREADCRUMBS_TRACE:null,
        BREADCRUMBS_REMOVE_CRUMBS:null,
        BREADCRUMBS_REMOVE_CRUMB:null,
        BREADCRUMBS_IMPORT_CRUMBS:null,
        BREADCRUMBS_ADD_CRUMB:null,
        BREADCRUMBS_RECORD_START:null,
        BREADCRUMBS_RECORD_PAUSE:null,
        BREADCRUMBS_RECORD_CONTINUE:null,
        BREADCRUMBS_RECORD_FINISH:null,
        BREADCRUMBS_RECORD_EDIT_NAME:null,

        SAVED_SCENE:null,
        SAVED_SCENE_GRAPH:null,
        SCENE_CHANGE: null,
        SCENE_SAVING: null,
        DELETE_SCENE: null,
        ADD_MEDIA_OBJECT: null,
        ADD_MEDIA_ATTEMPT: null,
        ADD_MEDIA_SUCCESS: null,
        ADD_MEDIA_FAILED: null,

        UPLOAD_MEDIA_ATTEMPT: null,
        UPLOAD_MEDIA_FINISHED: null,

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

        /* UI based notification messages for users */
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

        /* APEP Scene Graph Viewer */
        RECEIVE_SCENES_FROM_GRAPH: null,
        RECIEVE_SCENES_AND_THEMES_FROM_SCORE: null
    }),

    PayloadSources: keymirror({
        VIEW_ACTION: null,
        HUB_ACTION: null
    })
};
