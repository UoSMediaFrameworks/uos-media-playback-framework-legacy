var keymirror = require('keymirror');

module.exports = {
    ActionTypes: keymirror({
        RECEIVE_ACTIVE_SCENE: null,

        RECEIVE_MEDIA_OBJECT_INSTANCE: null,

        RECEIVE_MEDIA_OBJECT_INSTANCE_PROPERTY_CHANGE: null,

        RECEIVE_CONTROLLER_RESET: null
    }),
};
