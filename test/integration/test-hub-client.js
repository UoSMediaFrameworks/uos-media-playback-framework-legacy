'use strict'

var assert = require('chai').assert;

var GraphStore = require('../../src/js/stores/graph-viewer-store');

var url = process.env.MEDIA_HUB;
var creds = {password: 'kittens'};


// APEP make sure you point at a real hub - this is an integration test

// APEP NOTES:
// comment out HubRecieveActions.tryListScenes();, HubRecieveActions.recieveSceneList(scenes);, HubRecieveActions.recieveSceneGraphList(sceneGraphs);
// if you want to read the test out put more easily
describe('HubClient', function () {


    describe('registerToGraphPlayerRoom', function() {
        beforeEach(function(done){
            this.timeout(13000);


            // APEP did this to attempt to handle the global variable used for socket.
            // APEP not strictly necessary now we disconnect every login attempt - ie branch new socket
            // every login is a branch new socket anyway because of socket = io(url, {forceNew: true});
            // it looks like forceNew was not removing event listeners.
            this.hubClient = require('../../src/js/utils/HubClient');
            this.hubClient.login(url, creds);

            // APEP give socket some time to connect
            setTimeout(done, 5000);
        });

        it('should only get a single on command firing', function(done) {
            this.timeout(11000);

            var counter = 0;
            GraphStore.addChangeListener(function() {
                counter++;
            });

            var testRoomId = "integrationtesting";

            this.hubClient.registerToGraphPlayerRoom(testRoomId);

            this.hubClient.publishSceneCommand(["testingsceneid"], testRoomId);

            // APEP give socket time to receive change listeners
            setTimeout(function() {
                assert.equal(counter, 1);
                done();
            }, 5000);
        });

        it('should only get a single on command firing after relogin in and registering to same room', function(done) {
            this.timeout(11000);

            var counter = 0;
            GraphStore.addChangeListener(function() {
                counter++;
            });

            var testRoomId = "integrationtesting";

            this.hubClient.registerToGraphPlayerRoom(testRoomId);

            this.hubClient.login(url, creds);

            this.hubClient.registerToGraphPlayerRoom(testRoomId);

            this.hubClient.publishSceneCommand(["testingsceneid"], testRoomId);

            // APEP give socket time to receive change listeners
            setTimeout(function() {
                assert.equal(counter, 1);
                done();
            }, 5000);
        });

        it('should only get a single on command even when registering to the same room twice', function(done) {
            this.timeout(11000);

            var counter = 0;
            GraphStore.addChangeListener(function() {
                counter++;
            });

            var testRoomId = "integrationtesting";

            this.hubClient.registerToGraphPlayerRoom(testRoomId);
            this.hubClient.registerToGraphPlayerRoom(testRoomId);

            this.hubClient.publishSceneCommand(["testingsceneid"], testRoomId);

            // APEP give socket time to receive change listeners
            setTimeout(function() {
                assert.equal(counter, 1);
                done();
            }, 5000);
        });

        it('should only get a single on command firing when registered twice to different rooms', function(done) {
            this.timeout(11000);

            var counter = 0;
            GraphStore.addChangeListener(function() {
                counter++;
            });

            var testRoomId = "integrationtesting";

            this.hubClient.registerToGraphPlayerRoom(testRoomId);

            var secondTestRoomId = testRoomId + "1";

            this.hubClient.registerToGraphPlayerRoom(secondTestRoomId);

            this.hubClient.publishSceneCommand(["testingsceneid"], testRoomId);

            // APEP give socket time to receive change listeners
            setTimeout(function() {
                assert.equal(counter, 1);
                done();
            }, 5000);
        });
    })
});
