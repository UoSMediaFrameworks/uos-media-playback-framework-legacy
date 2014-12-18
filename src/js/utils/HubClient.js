'use strict';
/*jshint browser:true */

var hubClient = require('media-hub-client');
var HubRecieveActions = require('../actions/hub-recieve-actions');
var client,
    HUB_TOKEN = 'HUB_TOKEN',
    HUB_URL = 'HUB_URL';

function _cleanLocalStorage () {
    localStorage.removeItem(HUB_TOKEN);
    localStorage.removeItem(HUB_URL);  
}

var HubClient = {
    login: function(url, creds) {
        var type;
        if (arguments.length === 0) {
            type = 'token';
            url = localStorage.getItem(HUB_URL);
            creds = {token: HubClient.getToken()};

            if (! url || ! creds) {
                // bad localstorage, or nothing in it, so just return
                _cleanLocalStorage();
                HubRecieveActions.recieveLoginResult(false, type);
                return;
            }
        } else {
            localStorage.setItem(HUB_URL, url);
        }

        if (! url || ! creds) {
            throw 'url and creds must be provided for login to function';
        }

        if (url) {
            client = hubClient({forceNew: true});
            client.connect(url, creds).then(function(token) {
                localStorage.setItem(HUB_TOKEN, token);
                HubRecieveActions.recieveLoginResult(true, type);
                client.listScenes().then(HubRecieveActions.recieveSceneList);
            }, function(error) {
                client.disconnect();
                HubRecieveActions.recieveLoginResult(false, type);
            });    
        }
    },

    logout: function() {
        _cleanLocalStorage();
        client.disconnect();
    },

    getToken: function() {
        return localStorage.getItem(HUB_TOKEN);
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

module.exports = HubClient;