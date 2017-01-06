'use strict';

var AppDispatcher = require('../dispatchers/app-dispatcher');
var assign = require('object-assign');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubClient = require('../utils/HubClient');
var CHANGE_EVENT = "change";
var _scenes = {};

function _updateScene (scene) {
    _scenes[scene._id] = scene;
}

var SceneStore = assign({}, EventEmitter.prototype, {
    getScene: function(id) {
        if (_scenes.hasOwnProperty(id)) {
            return _.cloneDeep(_scenes[id]);
        }
    },
    emitChange: function(){
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback){
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback){
        this.removeListener(CHANGE_EVENT, callback);
    },

    dispatcherIndex: AppDispatcher.register(function(payload){
        var action = payload.action; // this is our action from handleViewAction

        var hC = HubClient;

        switch(action.type){
            case ActionTypes.SCENE_CHANGE:
                _updateScene(action.scene);
                SceneStore.emitChange();
                break;

            case ActionTypes.DELETE_SCENE:
                console.log("SceneStore - DELETE SCENE");
                try {
                    var sceneId = action.sceneId;
                    //APEP Unsure why but HubClient is null here.. so have had to hack and use require
                    require('../utils/HubClient').deleteScene(sceneId);
                    delete _scenes[sceneId];
                    SceneStore.emitChange();
                } catch (e) {
                    alert(e);
                    throw e;
                }

                break;

            case ActionTypes.ADD_MEDIA_OBJECT:
                var scene = _scenes[action.sceneId];
                scene.scene.push(action.mediaObject);
                HubClient.save(scene);
                break;

            // should only be triggered when server sends data back, so no need to save
            case ActionTypes.RECIEVE_SCENE:
                _updateScene(action.scene);
                SceneStore.emitChange();
                break;
        }

        SceneStore.emitChange();

        return true;
    })
});

module.exports = SceneStore;
