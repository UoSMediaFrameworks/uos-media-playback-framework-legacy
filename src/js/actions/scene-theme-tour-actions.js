'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var PlaybackConstants = require('../constants/playback-constants').ActionTypes;

var SceneThemeTourActions = {

    /**
     * When the graph-viewer (to be renamed) changes scene-theme combo for playback
     * We publish update view action for the playback store to update the SceneListener (to be renamed)
     * @param scene
     * @param themeQuery
     */
    setActiveSceneForPlayback: function(scene, themeQuery) {
        AppDispatcher.handleViewAction({
            type: PlaybackConstants.SCENE_THEME_CHANGE,
            scene: scene,
            themeQuery: themeQuery
        });
    }

};

module.exports = SceneThemeTourActions;
