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
var CredentialValidator = require('./credential-validation');


var HubClient = {
    
    login: function(url, creds, callback) {
        
        var LoginType;

        //MK credential format validation
        if(creds == null) {
            LoginType = "token";
            creds = {token: connectionCache.getToken()};
            if (! url || ! creds.token) {
                // bad localstorage, or nothing in it, so just return
                connectionCache.clear();
                console.log("Login attempt failed, please provide credentials in a valid format")
                HubRecieveActions.recieveLoginResult(false);
                return;
            }
        } else if (CredentialValidator.isValidUsernameAndPasswordRequest(creds)) {
            LoginType = "userPass"  
            connectionCache.setHubUrl(url);
        } else if (CredentialValidator.isValidPasswordOnlyRequest(creds)) {         
            LoginType = "passwordOnly"
            connectionCache.setHubUrl(url);
        } else if (CredentialValidator.isValidPublicRequest(creds)) {
            LoginType = "publicContent"
            connectionCache.clear(); //MK make sure no previous connection details are kept! (shouldn't be any anyway)
        } else {
            console.log("Login details were provided in an incorrect format", creds);
            HubRecieveActions.recieveLoginResult(false);
            return;
        }
        
        // APEP if we had a socket open already, we should force disconnect
        // this also removes any previous on listeners we added
        if(socket) {
            socket.disconnect();
        }
        socket = io(url, {forceNew: true});
        socket.on('connect',function() {

            switch(LoginType) {
                case "publicContent":
                    console.log("auth - public: ");
                    socket.emit('auth', creds, function(err, token, roomId, contentRef) {/*AJF: callback extended to accept the groupID of the user*/
                        
                        if (err) {
                            socket.disconnect();
                            HubRecieveActions.recieveLoginResult(false, err.toString());
                        } else {
                            //MK register to roomID not socket ID
                            connectionCache.setSocketID(roomId);
                            connectionCache.setHubToken(token)
                            console.log("ROM", roomId)
                            HubClient.registerToGraphPlayerRoom(creds.roomID || roomId)
                            if(callback) {
                                callback(roomId, contentRef)
                            }
                            HubRecieveActions.recieveLoginResult(true);
                        }
                    });
                    break;
                default:
                    socket.emit('auth', creds, function(err, token, socketID/*AJF: doesn't get used here*/, user) {/*AJF: callback extended to accept the groupID of the user*/
                                    console.log("auth - err: ", err);
                                    if (err) {
                                        socket.disconnect();
                                        HubRecieveActions.recieveLoginResult(false, err.toString());
                                    } else {
                                        connectionCache.setHubToken(token);
                                        connectionCache.setSocketID(socketID);
                                        console.log("Setting groupID in HubClient to:,", user._id);
                                        connectionCache.setGroupID(user._id);//AJF: set the groupID

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
                    break;
            }
            console.log("Socket connecting to hub")
            
        });

        socket.on('connect_error', function(err) {
            HubRecieveActions.errorMessage(
                "Connection to hub failed: " +
                err.toString() +
                "\nTrying to reconnect.");
            HubRecieveActions.recieveLoginResult(false);
        });

        socket.on('sceneUpdate', HubRecieveActions.recieveScene);

        // APEP we only want to add these listeners once per socket, since login tears down old socket connect this is valid now
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

    },

    getUserObject: function(callback)
        {  
            console.log('getUser')
            socket.emit('getUser', function(err,user) {
                if (err) {
                    return callback(null);
                } else {
                    return callback(user);
                }
            })
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

    create: function(scene, cb) {
        socket.emit('createScene', scene, function(err, newScene) {
            if (err) {
                HubRecieveActions.errorMessage('Couldn\'t create scene, please try again');
            } else {
                toastr.success('Successfully created scene');
                if (cb) {
                    cb(newScene);
                }
                // APEP update the scene saving store for a successful save
                HubRecieveActions.sceneSaved(newScene);
                // APEP publish that we have received a new version of the scene
                HubRecieveActions.recieveScene(newScene);

                // APEP Make sure the V2 scene store is up to date
                SceneActions.getFullScene(newScene._id);
            }
        })
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

                // APEP update the scene saving store for a successful save
                HubRecieveActions.sceneSaved(newScene);
                // APEP publish that we have received a new version of the scene
                HubRecieveActions.recieveScene(newScene);

                // APEP Make sure the V2 scene store is up to date
                SceneActions.getFullScene(newScene._id);
            }
        });
    },

    saveSceneGraph: function(sceneGraph, cb) {

        // APEP Hack - Block the merged graph from running node list generation.
        // APEP this process was done by a script and we don't want to override its results
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

        // APEP TODO we need to add some logic to handle any cases we need to unregister the old room.

        // APEP register for updates.
        socket.emit('register', "/#" + roomId);

        connectionCache.setSocketID(roomId);

    }
};

module.exports = HubClient;
