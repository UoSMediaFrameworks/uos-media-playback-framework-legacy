'use strict';
/*jshint browser:true */

var HubRecieveActions = require('../actions/hub-recieve-actions');
var io = require('socket.io-client');
var SceneActions = require('../actions/scene-actions');
var assetStore = require('./asset-store');
var connectionCache = require('./connection-cache');
var NodeListGeneration = require('./scene-graph/node-list-generation');
var toastr = require('toastr');
var socket;
var _ = require('lodash');

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
            console.log("connect")
            socket.emit('auth', creds, function(err, token, socketID/*AJF: doesn't get used here*/, groupID) {/*AJF: callback extended to accept the groupID of the user*/
                console.log("auth")
                if (err) {
                    socket.disconnect();
                    HubRecieveActions.recieveLoginResult(false, err.toString());
                } else {
                    connectionCache.setHubToken(token);
                    connectionCache.setSocketID(socketID);
                    console.log("Setting groupID in HubClient to: " + groupID);
                    connectionCache.setGroupID(groupID);//AJF: set the groupID

                    //Angel P: I am calling this function to register the listener to a specific room ID
                    //In order for the layout components graph to communicate with the Scene graph editor.
                    HubClient.registerToGraphPlayerRoom(socketID)

                    HubRecieveActions.recieveLoginResult(true);
                    HubRecieveActions.tryListScenes();

                    socket.emit('listScenes', function(err, scenes) {
                        if (err) throw err;
                        HubRecieveActions.recieveSceneList(scenes);
                    });

                    socket.emit('listSceneGraphs', function(err, sceneGraphs) {
                        if(err) throw err;
                        HubRecieveActions.recieveSceneGraphList(sceneGraphs);
                    })
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
        console.log("loadScene",id)
        socket.emit('loadScene', id, function(err, scene) {
            if (err || ! scene) {
                /*HubRecieveActions.errorMessage('Couldn\'t load requested scene, reload the page and try again');*/
            } else {
                console.log("loading requested scene")
                HubRecieveActions.recieveScene(scene);
            }
        });
    },

    loadSceneWithCb: function(id, cb) {
        socket.emit('loadScene', id, function(err, scene) {
            if (err || ! scene) {
                cb(null);
            } else {
                cb(scene);
            }
        });
    },

    loadSceneGraph: function(id) {
        socket.emit('loadSceneGraph', id, function(err, sceneGraph) {
            if (err || ! sceneGraph) {
               /* HubRecieveActions.errorMessage('Couldn\'t load requested scene graph, reload the page and try again');*/
            } else {
                HubRecieveActions.recieveSceneGraph(sceneGraph);
            }
        });
    },

    save: function(scene, cb) {
        socket.emit('saveScene', scene, function(err, newScene) {
            if (err) {
                HubRecieveActions.errorMessage('Couldn\'t save scene, please try again');
            } else {
                toastr.success('Save successful');
                if (cb) {
                    cb(newScene);
                }

                HubRecieveActions.recieveScene(newScene);

                // APEP Make sure the V2 scene store is up to date
                SceneActions.getFullScene(newScene._id);
            }
        });
    },

    saveSceneGraph: function(sceneGraph, cb) {

        if(sceneGraph._id !== "579a2186792e8b3c827d2b15") {
            NodeListGeneration.generateNodeListForSceneGraph(sceneGraph);
        }

        socket.emit('saveSceneGraph', sceneGraph, function(err, newSceneGraph) {
            if(err) {
                HubRecieveActions.errorMessage('Couldn\'t save scene graph, please try again');
            } else {
                if(cb) {
                    cb(newSceneGraph);
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

    deleteSceneGraph: function(id) {
        socket.emit('deleteSceneGraph', id, function(err){
            if(err) {
                HubRecieveActions.errorMessage('Couldn\'t delete scene graph, please try again');
            }
        });
    },

    subscribeScene: function(id) {
        // no confirmation handler as of yet
        console.log("subscribeSceneid",id)
        socket.emit('subScene', id, function(err, scene) {
            if (err) {
                HubRecieveActions.errorMessage("Couldn't subscribe to scene, please reload the page");
            } else {
                console.log("subscribeScene",scene)
                HubRecieveActions.recieveScene(scene);
            }
        });
    },

    unsubscribeScene: function(id) {
        // no confirmation handler as of yet
        socket.emit('unsubScene', id);
    },
    publishSceneCommand: function(sceneList, roomId) {
        // APEP allow the score playback functionality to publish commands
        socket.emit("sendCommand", roomId, 'showScenes', sceneList);
    },
    publishScoreCommand: function(score, roomId) {
        // APEP allow the score playback functionality to publish commands
        socket.emit("sendCommand", roomId, 'showScenesAndThemes', score);
    },
    getSceneGraph:function(sceneId){
        socket.emit('loadSceneGraph', sceneId, function (err, sceneGraph) {
            if (err) {
                HubRecieveActions.errorMessage("Couldn't subscribe to scene, please reload the page");
            } else {
                HubRecieveActions.recieveSceneGraph(sceneGraph);
            }
        });
    },
    registerToGraphPlayerRoom: function(roomId) {

        console.log("HubClient - registerToGraphPlayerRoom - roomId: " + roomId);

        // APEP TODO we need to unregister the old room.

        // APEP register for updates.
        socket.emit('register', "/#" + roomId);

        connectionCache.setSocketID(roomId);

        socket.on('command', function(data) {
            console.log("HubClient - on command - data: ", data);
            if (data.name === 'showScenes') {
                // APEP publish scene ID list
                HubRecieveActions.recieveSceneListForPlayer(data.value);
            } else if (data.name === 'showScenesAndThemes') {
                HubRecieveActions.recieveSceneAndThemeListForPlayer(data.value);
            } else {
                HubRecieveActions.errorMessage("Failed to receive scene list for playback");
            }
        });
    }
};

module.exports = HubClient;
