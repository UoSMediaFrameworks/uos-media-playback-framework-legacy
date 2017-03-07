'use strict';
/*jshint browser: true */
var SceneConstants = require('../constants/scene-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var getVimeoId = require('../utils/get-vimeo-id');
var objectAssign = require('object-assign');
var ActionTypes = SceneConstants.ActionTypes;
var hat = require('hat');
var _ = require('lodash');
var soundCloud = require('../utils/sound-cloud');
var vimeoApi = require('../utils/vimeo-api');
var assetStore = require('../utils/asset-store');
var hashHistory = require('react-router').hashHistory;
var toastr = require('toastr');

var SceneActions = {
    updateScene: function (scene) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: scene
        });

        // APEP This is very unusual to get a null for HubClient here, we've seen this in another file
        // Something wrong is definitely happening ( potentially misuse of SceneActions )
        var hC = require('../utils/HubClient');
        hC.save(scene);
    },

    addMediaObject: function (sceneId, mediaObject) {
        // add a default empty tags attribute incase someone isn't specifying it
        var obj = objectAssign({tags: ''}, mediaObject);

        AppDispatcher.handleViewAction({
            type: ActionTypes.ADD_MEDIA_OBJECT,
            sceneId: sceneId,
            mediaObject: obj
        });

        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_SUCCESS
        });
    },

    addText: function (sceneId, text) {
        SceneActions.addMediaObject(sceneId, {
            tags: '',
            type: 'text',
            text: text,
            style: {
                'z-index': '1'
            }
        });

    },

    addVimeo: function (sceneId, vimeoUrl) {

        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_ATTEMPT,
            value: vimeoUrl
        });

        vimeoApi.video(getVimeoId(vimeoUrl), function (err, data) {
            if (err) {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.ADD_MEDIA_FAILED
                });
            } else {
                var tags = _(data.tags).pluck('tag').map(function (x) {
                    return x.trim();
                }).value().join(', ');

                SceneActions.addMediaObject(sceneId, {
                    type: 'video',
                    volume: 100,
                    url: vimeoUrl,
                    tags: tags,
                    style: {
                        'z-index': '1'
                    },
                    autoreplay: 0
                });


            }
        });
    },

    addSoundCloud: function (sceneId, soundCloudUrl) {
        // so far keep it easy
        AppDispatcher.handleServerAction({
            type: ActionTypes.ADD_MEDIA_ATTEMPT,
            value: soundCloudUrl
        });
        soundCloud.tags(soundCloudUrl, function (err, data) {
            if (err) {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.ADD_MEDIA_FAILED,
                    value: err
                });
            } else {
                var tags = soundCloud.convertTags(data[0] + ' ' + data[1]);
                SceneActions.addMediaObject(sceneId, {
                    type: 'audio',
                    volume: 100,
                    url: soundCloudUrl,
                    tags: tags,
                    style: {
                        'z-index': '1'
                    }
                });

            }
        });
    },


    removeMediaObject: function (scene, index) {
        var copy = _.cloneDeep(scene);
        var removedObject = copy.scene.splice(index, 1);

        if (removedObject.length === 0) {
            toastr.warning("attempted to remove mediaObject not found in scene");
            return;
        }

        AppDispatcher.handleViewAction({
            type: ActionTypes.SCENE_CHANGE,
            scene: copy
        });

        //ANGEL P: Got the issue of the hubclient being null
        var hC = require('../utils/HubClient');
        hC.save(copy);
    },

    logout: function () {
        AppDispatcher.handleViewAction({
            type: ActionTypes.HUB_LOGOUT
        });

        //APEP: HubClient null pointer
        var hC = require('../utils/HubClient');
        hC.logout();

        hashHistory.push('login');
    },

    dismissStatus: function (alertId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.STATUS_MESSAGE_REMOVE,
            message: alertId,
            id: alertId
        });
    },

    // APEP OPTIONAL callback (cp) for allowing upload after upload
    _handleUploadAsset: function(alertId, sceneId, status, data, file, cb){
        var msg;
        if(status === 'warning' ){
            msg = 'No tags found in ' + file.name;
        }else if(status === 'danger' ){
            msg =  'Upload unsuccessful!';
        }else if(status === 'unsupported'){
            msg =  'File Type is unsupported';
        }else{
            msg =   'Upload successful!';
        }

        AppDispatcher.handleServerAction({
            type: ActionTypes.STATUS_MESSAGE_UPDATE,
            id: alertId,
            status: status,
            message: msg
        });

        var msecs = status === 'success' ? 1000 : 10000;

        setTimeout(function () {
            AppDispatcher.handleServerAction({
                type: ActionTypes.STATUS_MESSAGE_REMOVE,
                id: alertId
            });
        }, msecs);

        if (status !== 'danger') {
            if(data.type != "video"){
                SceneActions.addMediaObject(sceneId, {
                    type: data.type,
                    url: data.url,
                    tags: data.tags,
                    style: {
                        'z-index': '1'
                    }
                });
            }else{
                SceneActions.addMediaObject(sceneId, {
                    type: data.type,
                    url: data.url,
                    tags: data.tags,
                    volume:100,
                    style: {
                        'z-index': '1'
                    },
                    autoreplay:1
                });
            }

        }
        
        // APEP 
        if(cb) {
            cb();
        }
    },

    finaliseResumableUploadAsset: function(sceneId, file, resumableFile, cb) {
        var alertId = hat();

        AppDispatcher.handleViewAction({
            type: ActionTypes.STATUS_MESSAGE,
            message: 'Uploading ' + file.name + '...',
            id: alertId,
            status: 'info'
        });

        var self = this;

        assetStore.resumableCreate(file, resumableFile, function (status, data){
            self._handleUploadAsset(alertId, sceneId, status, data, file, cb);
        });
    },

    uploadAsset: function (sceneId, file) {
        var alertId = hat();
        AppDispatcher.handleViewAction({
            type: ActionTypes.STATUS_MESSAGE,
            message: 'Uploading ' + file.name + '...',
            id: alertId,
            status: 'info'
        });

        var self = this;

        assetStore.create(file, function (status, data) {
            self._handleUploadAsset(alertId, sceneId, status, data, file);
        });
    },
    getVideoMediaObjectData: function (mediaObject) {
        var alertId = hat();
        AppDispatcher.handleViewAction({
            type: ActionTypes.GET_TRANSCODED_STATUS_ATTEMPT,
            message: 'Calling Database for ' + mediaObject.url,
            id: alertId,
            status: 'info'
        });
        assetStore.checkTranscodedStatus(mediaObject, function (err, data) {
            if (err) {
                console.log("checkTranscodedStatus Error", err)
                AppDispatcher.handleViewAction({
                    type: ActionTypes.GET_TRANSCODED_STATUS_FAILURE,
                    value:err
                })
            } else {
                AppDispatcher.handleViewAction({
                    type: ActionTypes.GET_TRANSCODED_STATUS_SUCCESS,
                    value:data
                })
            }
        })
    },

    // APEP this is not async - this could be changed if required but like other scene store, this should be preloaded
    // Probably shouldn't add callback as react component can have a listener for FullSceneStore (will just need to
    // make sure this is called to load the data from server)
    getFullScene: function(sceneId, cb) {
        assetStore.getFullScene(sceneId, function(err, scene){
            if(!err && scene) {

                if(cb) {
                    cb (scene);
                } else {
                    AppDispatcher.handleServerAction({
                        type: ActionTypes.RECIEVE_FULL_SCENE,
                        scene: scene
                    });
                }
            } else {
                if(cb) {
                    cb (null);
                }
            }
        });
    }
};

module.exports = SceneActions;
