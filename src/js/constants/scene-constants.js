var keymirror = require('keymirror');

module.exports = {
    ActionTypes: keymirror({
        SCENE_CHANGE: null,
        ADD_MEDIA_OBJECT: null,
        RECIEVE_SCENE_LIST: null,
        RECIEVE_SCENE: null,
        HUB_LOGIN_ATTEMPT: null,
        HUB_LOGIN_RESULT: null,
        HUB_LOGOUT: null
    }),
    PayloadSources: keymirror({
        VIEW_ACTION: null,
        HUB_ACTION: null
    })
};