'use strict';
/*jshint browser:true */

var hubClient = require('media-hub-client');
var HubRecieveActions = require('../actions/hub-recieve-actions');
var HubSendActions = require('../actions/hub-send-actions');
var assetStore = require('./asset-store');
var connectionCache = require('./connection-cache');
var client;

var HubClient = {
    login: function(url, creds) {
        var type;
        switch (arguments.length) {
            case 1:
                type = 'token';
                creds = {token: connectionCache.getToken()};

                if (! url || ! creds.token) {
                    // bad localstorage, or nothing in it, so just return
                    connectionCache.clear();
                    HubRecieveActions.recieveLoginResult(false);
                    return;
                }
                break;
            case 2:
                connectionCache.setHubUrl(url);
                break;
            default:
                throw 'url and creds must be provided for login to function';
        }

        client = hubClient({forceNew: true});
        client.connect(url, creds).then(function(token) {
            connectionCache.setHubToken(token);
            HubRecieveActions.recieveLoginResult(true);
            HubRecieveActions.tryListScenes();
            client.listScenes().then(HubRecieveActions.recieveSceneList);
        }, function(error) {
            client.disconnect();
            HubRecieveActions.recieveLoginResult(false, error.toString());
        });    
    },

    logout: function() {
        connectionCache.clear();
        client.disconnect();
    },

    loadScene: function(id) {
        client.loadScene(id).then(HubRecieveActions.recieveScene);
    },

    save: function(scene, cb) {
        client.saveScene(scene).then(function(newScene) {
            if (cb) {
                cb(newScene);
            }
        });
    },

    deleteScene: function(id) {
        client.deleteScene(id).then(function() {
            assetStore.removeUnusedImages();
        });
    },

    subscribeScene: function(id) {
        // no confirmation handler as of yet
        client.subScene(id, HubRecieveActions.recieveScene);
    },

    unsubscribeScene: function(id) {
        // no confirmation handler as of yet
        client.unsubScene(id);
    }
};

module.exports = HubClient;