'use strict';

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var _ = require('lodash');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var SceneActions = require('../actions/scene-actions');
var HubClient = require('../utils/HubClient');
var _scenes = {};

function _updateScene(scene) {
    _scenes[scene._id] = scene;
}

class SceneStore extends Store {
    constructor() {
        super(Dispatcher);
    }

    // APEP TODO the below needs a bit of refactoring
    __onDispatch(payload) {
        var action = payload.action; // this is our action from handleViewAction
        switch (action.type) {
            case ActionTypes.SCENE_CHANGE:
                _updateScene(action.scene);
                this.emitChange();
                break;

            case ActionTypes.DELETE_SCENE:
                console.log("SceneStore - DELETE SCENE");
                try {
                    var sceneId = action.sceneId;
                    //APEP Unsure why but HubClient is null here.. so have had to hack and use require
                    require('../utils/HubClient').deleteScene(sceneId);
                    delete _scenes[sceneId];
                    this.emitChange();
                } catch (e) {
                    throw e;
                }

                break;

            case ActionTypes.ADD_MEDIA_OBJECT:
                var scene = _scenes[action.sceneId];
                scene.scene.push(action.mediaObject);
                HubClient.save(scene);
                this.emitChange();
                break;

            // should only be triggered when server sends data back, so no need to save
            case ActionTypes.RECIEVE_SCENE:
                SceneActions.getFullScene(action.scene._id);
                _updateScene(action.scene);
                this.emitChange();
                break;
        }

        return true;
    }

    getScene (id) {
        if (_scenes.hasOwnProperty(id)) {
            return _.cloneDeep(_scenes[id]);
        }
    }

    emitChange() {
        super.__emitChange();
    };

    addChangeListener(callback) {
        super.addListener(callback);
    };

    removeChangeListener(callback) {
        // APEP TODO
    }
}

module.exports = new SceneStore();
