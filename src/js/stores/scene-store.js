'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var SceneActions = require('../actions/scene-actions');
var HubClient = require('../utils/HubClient');
var CHANGE_EVENT = "change";
var _scenes = {};

function _updateScene(scene) {
    _scenes[scene._id] = scene;
}

var SceneStore = assign({}, EventEmitter.prototype, {
    getScene: function (id) {
        if (_scenes.hasOwnProperty(id)) {
            return _.cloneDeep(_scenes[id]);
        }
    },
    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action; // this is our action from handleViewAction
        switch (action.type) {
            case ActionTypes.SCENE_CHANGE:
                _updateScene(action.scene);
                SceneStore.emitChange();
                break;

            case ActionTypes.DELETE_SCENE:
                try {
                    var sceneId = action.sceneId;
                    //APEP Unsure why but HubClient is null here.. so have had to hack and use require
                    require('../utils/HubClient').deleteScene(sceneId);
                    delete _scenes[sceneId];
                    SceneStore.emitChange();
                } catch (e) {
                    throw e;
                }
                break;

            case ActionTypes.ADD_MEDIA_OBJECT:
                try {
                    var scene = _scenes[action.sceneId];
                    scene.scene.push(action.mediaObject);
                    //TODO: AngelP the age old bug continues - suspission is circular ref
                    require('../utils/HubClient').save(scene);
                    SceneStore.emitChange();
                } catch(e){
                    throw e;
                }
                break;

            // should only be triggered when server sends data back, so no need to save
            case ActionTypes.RECIEVE_SCENE:
                SceneActions.getFullScene(action.scene._id)
                _updateScene(action.scene);
                SceneStore.emitChange();
                break;
        }

        return true;
    })
});

module.exports = SceneStore;
