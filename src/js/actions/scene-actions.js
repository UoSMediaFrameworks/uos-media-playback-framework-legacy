var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var ActionTypes = SceneConstants.ActionTypes;
var SceneActions = {
    update: function(scene) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.CHANGE,
            scene: scene
        });
        HubClient.save(scene);
    }
};

module.exports = SceneActions;  