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
        SCENE_GRAPH_UPDATE: null,
        SCENE_GRAPH_ADD_SCENE: null,
        SCENE_GRAPH_REMOVE_SCENE: null,
    }),
    PayloadSources: keymirror({
        VIEW_ACTION: null,
        HUB_ACTION: null
    })
};
