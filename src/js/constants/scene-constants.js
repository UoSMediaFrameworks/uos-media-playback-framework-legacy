var keymirror = require('keymirror');

module.exports = {
    ActionTypes: keymirror({
        CHANGE: null,
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