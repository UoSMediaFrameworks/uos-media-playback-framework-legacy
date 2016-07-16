'use strict';
/*jshint browser:true */

var HubRecieveActions = require('../actions/hub-recieve-actions');
var io = require('socket.io-client');
var HubSendActions = require('../actions/hub-send-actions');
var assetStore = require('./asset-store');
var connectionCache = require('./connection-cache');
var socket;

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

        socket = io(url, {forceNew: true});

        socket.on('connect',function() {
            socket.emit('auth', creds, function(err, token, socketID/*AJF: doesn't get used here*/, groupID) {/*AJF: callback extended to accept the groupID of the user*/
                if (err) {
                    socket.disconnect();
                    HubRecieveActions.recieveLoginResult(false, err.toString());
                } else {
                    connectionCache.setHubToken(token);
					
                    HubRecieveActions.recieveLoginResult(true);
                    HubRecieveActions.tryListScenes();
					
					console.log("Setting groupID in HubClient to: " + groupID);
					connectionCache.setGroupID(groupID);//AJF: set the groupID
					
                    socket.emit('listScenes', function(err, scenes) {
                        if (err) throw err;
                        HubRecieveActions.recieveSceneList(scenes);
                    });
                }
            });
        });

        socket.on('connect_error', function(err) {
            HubRecieveActions.errorMessage(
                "Connection to hub failed: " + 
                err.toString() +
                "\nTrying to reconnect.");
            HubRecieveActions.recieveLoginResult(false);
        });

        socket.on('sceneUpdate', HubRecieveActions.recieveScene);
    },

    logout: function() {
        connectionCache.clear();
        socket.disconnect();
    },

    loadScene: function(id) {
        socket.emit('loadScene', id, function(err, scene) {
            if (err || ! scene) {
                HubRecieveActions.errorMessage('Couldn\'t load requested scene, reload the page and try again');
            } else {
                HubRecieveActions.recieveScene(scene);    
            }
        });
    },

    save: function(scene, cb) {
        socket.emit('saveScene', scene, function(err, newScene) {
            if (err) {
                HubRecieveActions.errorMessage('Couldn\'t save scene, please try again');
            } else {
                if (cb) {
                    cb(newScene);
                }    
            }
        });
    },

    deleteScene: function(id) {
        socket.emit('deleteScene', id, function(err) {
            if (err) {
                HubRecieveActions.errorMessage('Couldn\'t delete scene, please try again');
            } else {
                assetStore.removeUnusedImages();    
            }
        });
    },

    subscribeScene: function(id) {
        // no confirmation handler as of yet
        socket.emit('subScene', id, function(err, scene) {
            if (err) {
                HubRecieveActions.errorMessage("Couldn't subscribe to scene, please reload the page");
            } else {
                HubRecieveActions.recieveScene(scene);
            }
        });
    },

    unsubscribeScene: function(id) {
        // no confirmation handler as of yet
        socket.emit('unsubScene', id);
    }
};

module.exports = HubClient;