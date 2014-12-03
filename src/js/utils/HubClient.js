'use strict';
/*jshint browser:true */

var hubClient = require('media-hub-client');
var HubRecieveActions = require('../actions/hub-recieve-actions');
var client,
    HUB_TOKEN = 'HUB_TOKEN',
    HUB_URL = 'HUB_URL';

module.exports = {
    
    login: function(url, creds) {
        if (arguments.length === 0) {
            url = localStorage.getItem(HUB_URL);
            creds = {token: localStorage.getItem(HUB_TOKEN)};
        } else {
            localStorage.setItem(HUB_URL, url);
        }

        if (! url || ! creds) {
            throw "url and creds must be provided for login to function";
        }

        if (url) {
            try {
                client = hubClient(url);
                client.authenticate(creds).then(function(token) {
                    localStorage.setItem(HUB_TOKEN, token);
                    HubRecieveActions.recieveLoginResult(true);
                    client.listScenes().then(HubRecieveActions.recieveSceneList);
                }, function() {
                    HubRecieveActions.recieveLoginResult(false);
                });    
            } catch (error) {
                HubRecieveActions.recieveLoginResult(false);
            }
            
        }
    },

    logout: function() {
        localStorage.removeItem(HUB_TOKEN);
        localStorage.removeItem(HUB_URL);
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

    subscribeScene: function(id) {
        // no confirmation handler as of yet
        client.subScene(id, HubRecieveActions.recieveSceneUpdate);
    },

    unsubscribeScene: function(id) {
        // no confirmation handler as of yet
        client.unsubScene(id);
    }
};