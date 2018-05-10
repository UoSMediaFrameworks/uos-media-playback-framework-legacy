const sinon = require('sinon');
const SendActions = require('../../src/js/actions/media-engine/send-actions');
const ReceiveActions = require('../../src/js/actions/media-engine/receive-actions');

const MediaEngineStore = require('../../src/js/stores/media-engine-store');
const InternalEventConstants = require('../../src/js/private-dependencies/internal-event-constants')

var assert = require('chai').assert;

const loaded = {
    "domain": null,
    "_events": {},
    "_eventsCount": 3,
    "_id": "5a8c1c6d7ecfdb3c0e0f8c8a",
    "type": "image",
    "url": "space.jpg",
    "sceneReference": {"sceneParams": {}, "sceneMediaReferences": {}},
    "_startTime": null,
    "_stopTime": 5,
    "_transitionTime": 1.4,
    "_transitionType": null,
    "_content": "space.jpg",
    "enable": false,
    "render": false,
    "state": {
        "initialState": "loaded",
        "states": {"loading": {}, "loaded": {}, "playing": {}, "stopped": {}},
        "eventListeners": {"*": []},
        "useSafeEmit": false,
        "hierarchy": {},
        "pendingDelegations": {},
        "_stamped": true,
        "inputQueue": [],
        "targetReplayState": "loaded",
        "state": "loaded",
        "priorAction": "",
        "currentAction": "",
        "inExitHandler": false
    },
    "behaviours": null
};

const playing = {
    "domain": null,
    "_events": {},
    "_eventsCount": 3,
    "_id": "5a8c1c6d7ecfdb3c0e0f8c8a",
    "type": "image",
    "url": "space.jpg",
    "sceneReference": {"sceneParams": {}, "sceneMediaReferences": {}},
    "_startTime": null,
    "_stopTime": 5,
    "_transitionTime": 1.4,
    "_transitionType": null,
    "_content": "space.jpg",
    "enable": false,
    "render": false,
    "state": {
        "initialState": "loaded",
        "states": {"loading": {}, "loaded": {}, "playing": {}, "stopped": {}},
        "eventListeners": {"*": []},
        "useSafeEmit": false,
        "hierarchy": {},
        "pendingDelegations": {},
        "_stamped": true,
        "inputQueue": [],
        "targetReplayState": "playing",
        "state": "playing",
        "priorAction": "",
        "currentAction": "",
        "inExitHandler": false
    },
    "behaviours": null
};

let sandbox;

describe('MediaEngineStore', function () {

    before(function () {
        this.connection = {
            id: "test"
        };
    });

    beforeEach(function() {
        this.sinon = sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('given a new instance, adds to pool and uses SendActions to tell Controller to change to PLAYING', function () {

        let stub = sandbox.stub(SendActions, "updateMediaInstance");

        ReceiveActions.receiveMediaObjectInstance(this.connection, loaded);

        // Make sure the SendActions have been called to change the state to PLAYING
        sinon.assert.calledOnce(SendActions.updateMediaInstance);

        // APEP make sure it was called with correct number of args
        assert(3 === stub.getCall(0).args.length);

        let firstArgument = stub.getCall(0).args[0];
        assert(firstArgument === SendActions.PLAY_MEDIA_COMMAND);

        // APEP TODO further tests
        let secondArg = stub.getCall(0).args[1];
        let thirdArg = stub.getCall(0).args[2];

    });

    it('make sure the store has saved to instance pool', function () {
        let mediaInstancePool = MediaEngineStore.getInstancePool();
        assert(mediaInstancePool.size === 1, "the instance pool should have a single entry");
        let mediaInstances = MediaEngineStore.getMedia();
        assert(mediaInstances.length === 1, "the instance pool can return an array of media instances");

        assert(mediaInstances[0].state.compositeState(), InternalEventConstants.MEDIA_OBJECT_INSTANCE.STATE.PLAYING);
    });

    it('after the controller sets the state to playing, a timer should be started to start ending playback', function(done) {

        this.timeout(6050);

        let stub = sandbox.stub(SendActions, "updateMediaInstance");

        ReceiveActions.receiveMediaObjectInstance(this.connection, playing);

        setTimeout(function() {

            // Make sure the SendActions have been called to change the state to DONE
            sinon.assert.calledOnce(SendActions.updateMediaInstance);

            // APEP make sure it was called with correct number of args
            assert(3 === stub.getCall(0).args.length);

            let firstArgument = stub.getCall(0).args[0];
            assert(firstArgument === SendActions.DONE_MEDIA_COMMAND);

            let mediaInstancePool = MediaEngineStore.getInstancePool();
            assert(mediaInstancePool.size === 0, "the instance pool should have a single entry");
            let mediaInstances = MediaEngineStore.getMedia();
            assert(mediaInstances.length === 0, "the instance pool can return an array of media instances");

            done();

        }, 6025)
    });
});
