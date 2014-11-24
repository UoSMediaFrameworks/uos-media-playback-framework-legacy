var keymirror = require('keymirror');

module.exports = {
    ActionTypes: keymirror({
        CHANGE: null    
    }),
    PayloadSources: keymirror({
        VIEW_ACTION: null,
        HUB_ACTION: null
    })
};