'use strict';
/*jshint browser:true */

// var SceneActions = require('../actions/scene-actions');
// var HubRecieveActions = require('../actions/hub-recieve-actions');

var io = require('socket.io-client');
var _ = require('lodash');

var MediaEngineReceiveActions = require('../../actions/media-engine/receive-actions');
var MediaEngineSendActions = require('../../actions/media-engine/send-actions');

// APEP 090518 turn into constants and / or even better pull the constants from the controller project
const BASE_TOPIC = "mediaframework.html.random.1.0.0.";

const ACTIVE_SCENE__STATE_CHANGE = "event.playback.scene.active"
const ACTIVE_SCENE__STATE_CHANGE_TOPIC = BASE_TOPIC + ACTIVE_SCENE__STATE_CHANGE;

const DEACTIVE_SCENE__STATE_CHANGE_TOPIC = BASE_TOPIC + "event.playback.scenes.deactive";


const MEDIA_OBJECT_INSTANCE__EVENTS__STATE_CHANGE = "event.playback.media.state.change";
const MEDIA_OBJECT_INSTANCE__EVENTS__STATE_CHANGE_TOPIC = BASE_TOPIC + MEDIA_OBJECT_INSTANCE__EVENTS__STATE_CHANGE;

const MEDIA_OBJECT_INSTANCE__EVENTS__PROPERTY_CHANGE = "event.playback.media.property.change";
const MEDIA_OBJECT_INSTANCE__EVENTS__PROPERTY_CHANGE_TOPIC = BASE_TOPIC + MEDIA_OBJECT_INSTANCE__EVENTS__PROPERTY_CHANGE;

var WebsocketHTMLRandomControllerConnection = {

    socket: null,

    /**
     * Setups the Media Engine connection to the async random html controller
     * @param url
     * @param creds
     */
    login: function(url, creds) {

        // APEP if we had a socket open already, we should force disconnect
        // this also removes any previous on listeners we added
        if(this.socket) {
            this.socket.disconnect();
        }

        console.log(`MediaEngineConnection - login ${url} ${JSON.stringify(creds)}`);

        this.socket = io(url, {forceNew: true});

        let self = this;

        this.socket.on('connect',function() {

            console.log(`MediaEngineConnection - received socket connection event`);

            self.socket.emit('auth', creds, function(err, token) {

                if (err) {
                    console.log(`MediaEngineConnection - error on auth event ${err.message}`);
                    return self.socket.disconnect();
                }

                console.log(`MediaEngineConnection - `)
            });
        });


        // APEP we only want to add these listeners once per socket, since login tears down old socket connect this is valid now
        this.socket.on(ACTIVE_SCENE__STATE_CHANGE_TOPIC, function() {
            MediaEngineReceiveActions.receiveActiveScene(null);
        });

        this.socket.on(MEDIA_OBJECT_INSTANCE__EVENTS__STATE_CHANGE, function(connection, instance) {
            MediaEngineReceiveActions.receiveMediaObjectInstance(connection, instance)
        });

        this.socket.on(MEDIA_OBJECT_INSTANCE__EVENTS__PROPERTY_CHANGE, function(connection, instance) {
            MediaEngineReceiveActions.receiveMediaObjectInstance(connection, instance)
        });
    },

    /**
     * Allow media instance state changes to be published to the controller
     * @param path
     * @param connection
     * @param instance
     */
    publishMediaInstanceStateChange: function(path, connection, instance) {
        this.socket.emit(path, connection, instance)
    }
};

module.exports = WebsocketHTMLRandomControllerConnection;
