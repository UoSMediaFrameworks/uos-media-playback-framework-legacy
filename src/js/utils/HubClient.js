'use strict';
var hubClient = require('media-hub-client');
var HubActions = require('../actions/hub-actions');
var client;

module.exports = {
    login: function(url, password) {
        client = hubClient(url);
        client.authenticate(password).then(function() {
            client.listScenes().then(HubActions.recieveSceneList);
        }, function() {
            console.log('login failed');
        });
    },
    save: function(scene) {
        client.saveScene(scene).then(function() {
            console.log('scene saved');
        });
    }
};