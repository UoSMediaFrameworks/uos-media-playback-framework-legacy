'use strict';

var hubClient = require('media-hub-client');
var HubRecieveActions = require('../actions/hub-recieve-actions');
var client;

module.exports = {
    login: function(url, password) {
        client = hubClient(url);
        client.authenticate(password).then(function() {
            HubRecieveActions.recieveLoginResult(true);
            client.listScenes().then(HubRecieveActions.recieveSceneList);
        }, function() {
            HubRecieveActions.recieveLoginResult(false);
        });
    },
    loadScene: function(id) {
        client.loadScene(id).then(HubRecieveActions.recieveScene);
    },
    save: function(scene) {
        client.saveScene(scene).then(function() {
            console.log('scene saved');
        });
    }
};