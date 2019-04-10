'use strict';
/*jshint browser:true */

var io = require('socket.io-client');
var _ = require('lodash');

var MediaEngineReceiveActions = require('../../actions/media-engine/receive-actions');
var HubRecieveActions = require('../../actions/hub-recieve-actions');

// APEP 090518 turn into constants and / or even better pull the constants from the controller project
const BASE_TOPIC = "mediaframework.html.random.1.0.0.";

const ACTIVE_SCENE__STATE_CHANGE = "event.playback.scene.active";
const ACTIVE_SCENE__STATE_CHANGE_TOPIC = BASE_TOPIC + ACTIVE_SCENE__STATE_CHANGE;

const DEACTIVE_SCENE__STATE_CHANGE_TOPIC = BASE_TOPIC + "event.playback.scenes.deactive";

const MEDIA_OBJECT_INSTANCE__EVENTS__STATE_CHANGE = "region.event.playback.media.state.change";
const MEDIA_OBJECT_INSTANCE__EVENTS__STATE_CHANGE_TOPIC = BASE_TOPIC + MEDIA_OBJECT_INSTANCE__EVENTS__STATE_CHANGE;

const MEDIA_OBJECT_INSTANCE__EVENTS__PROPERTY_CHANGE = "region.event.playback.media.property.change";
const MEDIA_OBJECT_INSTANCE__EVENTS__PROPERTY_CHANGE_TOPIC = BASE_TOPIC + MEDIA_OBJECT_INSTANCE__EVENTS__PROPERTY_CHANGE;

const REFRESH_EVENT = "event.playback.refresh";
const REFRESH_EVENT_TOPIC = BASE_TOPIC + REFRESH_EVENT;

const PLAYER_ID = process.env.PLAYER_ID.toString();

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

        creds.playerId = PLAYER_ID;

        this.socket = io(url, {forceNew: true, transports: ['websocket']});

        let self = this;

        this.socket.on('connect',function() {

            console.log(`MediaEngineConnection - received socket connection event`);

            HubRecieveActions.statusMessageWithAutoClose("html random connection connection made");

            self.socket.emit('auth', creds, function(err, token) {

                if (err) {
                    console.log(`MediaEngineConnection - error on auth event ${err.message}`);
                    return self.socket.disconnect();
                }

                console.log(`MediaEngineConnection - `)
            });
        });

        // APEP 010618 when we disconnect, for now lets reset the player
        this.socket.on('disconnect', function() {
            HubRecieveActions.errorMessage("html random controller connection lost - resetting playback state - if the controller was restart due to a load content call, await connection message");
            MediaEngineReceiveActions.receiveControllerReset();
        });

        // APEP we only want to add these listeners once per socket, since login tears down old socket connect this is valid now
        this.socket.on(ACTIVE_SCENE__STATE_CHANGE_TOPIC, function() {
            MediaEngineReceiveActions.receiveActiveScene(null);
        });

        this.socket.on(MEDIA_OBJECT_INSTANCE__EVENTS__STATE_CHANGE_TOPIC, function(payload) {
            MediaEngineReceiveActions.receiveMediaObjectInstance(payload.connection, payload.instance)
        });

        this.socket.on(MEDIA_OBJECT_INSTANCE__EVENTS__PROPERTY_CHANGE_TOPIC, function(payload) {
            MediaEngineReceiveActions.receiveMediaObjectInstanceProperty(payload.connection, payload.instance)
        });

        // APEP we want to listen for additional controller events
        this.socket.on(REFRESH_EVENT_TOPIC, function () {
            location.reload();
        });
    },

    /**
     * Allow media instance state changes to be published to the controller
     * @param path
     * @param connection
     * @param instance
     */
    publishMediaInstanceStateChange: function(path, connection, instance) {
        this.socket.emit(path, {id: this.socket.id}, instance)
    }
};

module.exports = WebsocketHTMLRandomControllerConnection;
