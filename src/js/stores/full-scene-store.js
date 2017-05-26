/**
 * Created by aaronphillips on 16/01/2017.
 */
'use strict';

var Dispatcher = require('../dispatchers/dispatcher');
var Store = require('flux/utils').Store;
var _ = require('lodash');
var ActionTypes = require('../constants/scene-constants').ActionTypes;

var _scenes = {};

function _updateScene (scene) {
    _scenes[scene._id] = scene;
}

class FullSceneStore extends Store {
    constructor() {
        super(Dispatcher);
    }

    __onDispatch(payload) {
        var action = payload.action; // this is our action from handleViewAction

        switch(action.type){
            // should only be triggered when server sends data back, so no need to save
            case ActionTypes.RECIEVE_FULL_SCENE:
                _updateScene(action.scene);
                this.emitChange();
                break;
        }

        return true;
    }

    getScene(id) {
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


module.exports = new FullSceneStore();
