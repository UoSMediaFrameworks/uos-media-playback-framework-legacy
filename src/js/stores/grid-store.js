/**
 * Created by Angel on 31/05/2017.
 */
var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');
var hat = require('hat');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var HubSendActions = require('../actions/hub-send-actions');
var connectionCache = require('../utils/connection-cache');
var LayoutManager = require('./managers/layout-manager');
var CHANGE_EVENT = 'CHANGE_EVENT';

var gridState = {
    scene: {
        name: "",
        _id: null
    },
    sceneGraph: {
        name: "",
        _id: null
    },
    roomId: connectionCache.getSocketID(),
    modeToggle: true,
    focusedType: null,
    poppedOutComponent: null,
    focusedMediaObject: null,
    layoutManager: new LayoutManager(),
    fromMonacoEditor: false
};

changeFocus = function (type) {
    gridState.focusedType = type;
};

changeMediaObjectFocus = function (index, fromMonacoEditor) {
    gridState.fromMonacoEditor = fromMonacoEditor;
    gridState.focusedMediaObject = index;
};

popoutComponent = function (item, width, height, isForPresentation) {

    gridState.poppedOutComponent = item.type;

    // APEP first we remove the component from the grid
    gridState.layoutManager.removeComponent(item.i);

    // APEP generate the new deep linking URL for the single component and all state required for transfer
    var location = window.location.origin;

    var newWindowUrl = null;
    var newWindow = null;

    if(isForPresentation) {
        newWindowUrl = location+"/#/presentation?sceneId=" + gridState.scene._id + "&roomId="+ connectionCache.getSocketID() + "&sceneGraphId=" + gridState.sceneGraph._id + "&type=" +gridState.poppedOutComponent +"&graphId=" + gridState.graphId;
        // APEP for a presentation pop out, we want this to fill the screen
        newWindow = window.open(newWindowUrl, '_blank');
    } else {
        newWindowUrl = location + "/#/pop-out-component?sceneId=" + gridState.scene._id + "&roomId=" + connectionCache.getSocketID() + "&sceneGraphId=" + gridState.sceneGraph._id + "&type=" + gridState.poppedOutComponent + "&graphId=" + gridState.graphId;
        // APEP for a pop out component, we want to use pop out a component to be the same size as it was in the grid
        newWindow = window.open(newWindowUrl, '_blank', "height=" + height + ",width=" + width);
    }

    // APEP when the new window has loaded, we can say the grid store has updated.
    newWindow.onload = function () {
        GridStore.emitChange()
    }
};

var GridStore = assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    // APEP TODO should be triggered from a VIEW action rather than direct store call
    focusScene: function (scene) {
        gridState.scene = scene;
        HubSendActions.loadScene(scene._id);
        gridState.focusedMediaObject = null;
        GridStore.emitChange();
    },
    focusSceneGraph: function (sceneGraph) {
        gridState.sceneGraph = sceneGraph;
        GridStore.emitChange();
    },

    getFocusedComponent: function () {
        return gridState.focusedType;
    },
    getFocusedSceneID: function () {
        return gridState.scene._id;
    },
    getFocusedSceneGraphID: function () {
        return gridState.sceneGraph._id;
    },
    getFocusedMediaObject: function () {
        return gridState.focusedMediaObject;
    },

    setLayoutFromPreset: function(presetLayout) {
        gridState.layoutManager.setLayoutFromPreset(presetLayout);
        GridStore.emitChange();
    },

    hasMaximisedView: function () {
        // APEP allow components to see if we have any maximised components.
        return _.filter(gridState.layoutManager.layout, function (item) {
                return item.state === "max";
            }).length !== 0;
    },
    setRoomId: function (room) {
        gridState.roomId = room;
    },
    getGridState: function () {
        // APEP TODO remove hack as when a component asks for layout, its asking for everything.  Needs clean up.
        var state = _.cloneDeep(gridState);
        state.layout = state.layoutManager.layout;
        return state;
    },
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action; // this is our action from handleViewAction
        switch (action.type) {
            case ActionTypes.COMP_MIN:
                gridState.layoutManager.minimize(action.index, action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_MAX:
                gridState.layoutManager.maximize(action.index, action.item, action.maxHeight);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_RESTORE:
                gridState.layoutManager.restore(action.index, action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_COLLAPSE_LEFT:
                gridState.layoutManager.collapseLeft(action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_COLLAPSE_RIGHT:
                gridState.layoutManager.collapseRight(action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_EXPAND_LEFT:
                gridState.layoutManager.expandLeft(action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_EXPAND_RIGHT:
                gridState.layoutManager.expandRight(action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_FOCUS_SWITCH:
                changeFocus(action.itemType);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_MEDIA_OBJECT_FOCUS_SWITCH:
                changeMediaObjectFocus(action.index, action.fromMonacoEditor);
                GridStore.emitChange();
                break;
            case ActionTypes.ADD_COMPONENT:
                gridState.layoutManager.addComponent(action.componentType);
                GridStore.emitChange();
                break;
            case ActionTypes.REMOVE_COMPONENT:
                gridState.layoutManager.removeComponent(action.componentId);
                GridStore.emitChange();
                break;
            case ActionTypes.LAYOUT_CHANGE:
                // saveToLS(action.layout);
                gridState.layoutManager.setLayout(action.layout);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_POPOUT:
                popoutComponent(action.item, action.width, action.height, action.isForPresentation);
                // APEP deferred emit change and delegated to popoutComponent function
                break;
            case ActionTypes.SAVED_SCENE:
                GridStore.focusScene(action.scene);
                break;
            case ActionTypes.SAVED_SCENE_GRAPH:
                GridStore.focusSceneGraph(action.sceneGraph);
                break;
            case ActionTypes.LAYOUT_PRESET_SELECTED:
                GridStore.setLayoutFromPreset(action.preset);
                break;
            // APEP allow us to catch DOM size changes so we can do the minimize size calculations for some components.
            case ActionTypes.GRID_CONTAINER_UPDATE:
                gridState.layoutManager.gridContainerDOMClientHeight = action.clientHeight;
                gridState.layoutManager.gridContainerDOMClientWidth = action.clientWidth;
                gridState.layoutManager.gridContainerNumberOfRows = action.numberOfRows;
                // APEP we do not want to emit a change and for any components to rerender for now.
                break;
        }

        return true;
    })
});

module.exports = GridStore;
