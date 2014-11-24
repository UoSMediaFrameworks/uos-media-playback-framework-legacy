var AppDispatcher = require('../dispatchers/app-dispatcher');
var merge = require('react/lib/merge');
var EventEmitter = require('events').EventEmitter;
var SceneConstants = require('../constants/scene-constants');

var CHANGE_EVENT = "change";
var _scene = {
  "version": "1",
  "name": "scene1",
  "scene": [
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://www.safehavenrr.org/Images/bunny.jpg",
        "anmiationIn": "default",
        "anmiationOut": "default",
        "cachePolicy": "default",
        "tags": "rabbit"
      }
    },
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://www.ikea.com/us/en/images/products/kritter-childrens-chair__0096632_PE236603_S4.JPG",
        "animiationIn": "default",
        "animiationOut": "default",
        "cachePolicy": "default",
        "tags": "chair"
      }
    },
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://research.fuseink.com/artifactimg/201210/MTM1MTUwOTc2MDE1MjYxXzE.jpg",
        "animiationIn": "default",
        "animiationOut": "default",
        "cachePolicy": "default",
        "tags": "rabbit, chair"
      }
    },
    {
        "mediaObject": {
            "url": "https://www.youtube.com/watch?v=cY_22EZRI-Y",
            "animiationIn": "default",
            "animiationOut": "default",
            "cachePolicy": "default",
            "tags": "rabbit",
            "name": "video",
            "type": "video"
        }
    },
    {
        "mediaObject": {
            "url": "http://www.therecordist.com/assets/sound/mp3_14/Water_Splash_1.mp3",
            "animiationIn": "default",
            "animiationOut": "default",
            "cachePolicy": "default",
            "tags": "splash",
            "name": "audio",
            "type": "audio"
        }
    },
    {
        "mediaObject": {
            "url": "http://www.therecordist.com/assets/sound/mp3_14/Thunder_Clap_Spring.mp3",
            "animiationIn": "default",
            "animiationOut": "default",
            "cachePolicy": "default",
            "tags": "thunder",
            "name": "audio",
            "type": "audio"
        }
    }
  ]
};

function _updateScene (scene) {
    _scene = scene;
}

var SceneStore = merge(EventEmitter.prototype, {
    getScene: function() {
        return _scene;
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
        switch(action.actionType){
            case SceneConstants.CHANGE:
                _updateScene(payload.action.scene);
                break;
        }
        AppStore.emitChange();

        return true;
    })
});

module.exports = SceneStore;