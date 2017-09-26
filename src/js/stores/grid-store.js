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
    isPoppedOut:false,
    poppedOutComponent:null,
    focusedMediaObject:null,
    layoutManager: new LayoutManager()
};

changeFocus = function (type) {
    gridState.focusedType = type;
    //AngelP: this is done to reset the focused media object when the scene changes
    gridState.focusedMediaObject  = null;
};
changeMediaObjectFocus = function(index){
    gridState.focusedMediaObject = index;
};

popoutComponent = function(item, width, height){

    gridState.isPoppedOut = true;
    gridState.poppedOutComponent = item.type;

    // APEP first we remove the component from the grid
    gridState.layoutManager.removeComponent(item.i);

    // APEP generate the new deep linking URL for the single component and all state required for transfer
    var location = window.location.origin;
    var newWindowUrl = location+"/#/pop-out-component?sceneId=" + gridState.scene._id + "&roomId="+ connectionCache.getSocketID() + "&sceneGraphId=" + gridState.sceneGraph._id + "&type=" +gridState.poppedOutComponent +"&graphId=" + gridState.graphId;

    var newWindow =  window.open(newWindowUrl, '_blank',"height="+height+",width="+width);

    newWindow.onload=function(){
        GridStore.emitChange()
    }
};

var GridStore = assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },
    focusScene: function (scene) {
        gridState.scene = scene;
        HubSendActions.loadScene(scene._id);
        gridState.focusedMediaObject= null;
        GridStore.emitChange();
    },
    focusSceneGraph: function (sceneGraph) {
        gridState.sceneGraph = sceneGraph;
        GridStore.emitChange();
    },

    // APEP TODO should be triggered from a VIEW action rather than direct store call

    getFocusedComponent: function () {
        return gridState.focusedType;
    },
    getFocusedSceneID: function () {
        return gridState.scene._id;
    },
    getPoppedOut:function(){
        return gridState.isPoppedOut;
    },
    getFocusedSceneGraphID: function () {
        return gridState.sceneGraph._id;
    },
    getFocusedMediaObject:function(){
      return gridState.focusedMediaObject;
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
                changeMediaObjectFocus(action.index);
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
                popoutComponent(action.item, action.width, action.height);
                // APEP deferred emit change and delegated to popoutComponent function
                break;
            case ActionTypes.SAVED_SCENE:
                GridStore.focusScene(action.scene);
                break;
            case ActionTypes.SAVED_SCENE_GRAPH:
                GridStore.focusSceneGraph(action.sceneGraph);
                break;


        }

        return true;
    })

});
module.exports = GridStore;
