/**
 * Created by Angel on 31/05/2017.
 */
var AppDispatcher = require('../dispatchers/app-dispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');
var hat = require('hat');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
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
    roomId: "presentation1",
    modeToggle: true,
    focusedType: null,
    layout: [
        {
            i: 'a',
            x: 0,
            y: 1,
            w: 2,
            h: 15,
            _w: 2,
            _h: 15,
            isResizeable: true,
            visible: true,
            type: "Scene-List",
            state: "default"
        },
        {
            i: 'b',
            x: 3,
            y: 1,
            w: 4,
            h: 8,
            _w: 4,
            _h: 8,
            isDraggable: true,
            isResizeable: true,
            visible: true,
            type: "Scene",
            state: "default"
        },
        {
            i: 'c',
            x: 3,
            y: 8,
            w: 4,
            h: 4,
            _w: 4,
            _h: 4,
            isResizeable: true,
            visible: true,
            type: "",
            state: "default"
        },
        {
            i: 'd',
            x: 3,
            y: 12,
            w: 4,
            h: 8,
            _w:4,
            _h: 8,
            isResizeable: true,
            visible: true,
            type: "Scene-Viewer",
            state: "default"
        }]
};

// APEP you are using global variables, the minimize and maximize function should not scoped differently in my opinion.
// Hence I've moved them here.
var minimize = function (index, component) {
    var item = _.find(gridState.layout, function (layoutItem) {
        return layoutItem.i == component.i;
    });
    item.w = 1;
    item.h = 1;
    item.visible = false;

    var newItemId = hat().toString();

    var newItem = {
        i: newItemId,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        _w: item._w,
        _h: item._h,
        type: item.type,
        visible: false
    };
    var lay = gridState.layout;
    lay[index] = newItem;
    gridState.layout = lay;
    console.log(_.isEqual(newItem, gridState.layout[index]));
};

var maximize = function (index, component, maxHeight) {
    _.each(gridState.layout, function (layoutItem) {
        layoutItem.visible = false;
    });
    var item = _.find(gridState.layout, function (layoutItem) {
        return layoutItem.i == component.i;
    });

    var newItemId = hat().toString();
    var newItem = {
        i: newItemId,
        x: item.x,
        y: item.y,
        w: 6,
        h: maxHeight,
        _w: item._w,
        _h: item._h,
        type: item.type,
        visible: true,
        state: "max",
        isResizeable: item.isResizeable
    };

    var lay = gridState.layout;
    lay[index] = newItem;
    gridState.layout = lay;
    console.log(_.isEqual(newItem, gridState.layout[index]));
};
// APEP TODO should be triggered from a VIEW action rather than direct store call
restore = function (index, component) {
    _.each(gridState.layout, function (layoutItem) {
        layoutItem.visible = true;
    });
    var item = _.find(gridState.layout, function (layoutItem) {
        return layoutItem.i == component.i;
    });
    item.w = item._w;
    item.h = item._h;
    var newItemId = hat().toString();
    var newItem = {
        i: newItemId,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        _w: item._w,
        _h: item._h,
        type: item.type,
        visible: true,
        state: "default",
        isResizeable: item.isResizeable
    };
    var lay = gridState.layout;
    lay[index] = newItem;
    gridState.layout = lay;
    console.log(_.isEqual(newItem, gridState.layout[index]));
};

//Angel P: this is currently hardcoded and based on the layout, this might be a design decision for our next meeting
changeMode = function () {
    gridState.modeToggle = !gridState.modeToggle;
    gridState.layout[1].type = gridState.modeToggle ? "Scene-Graph-List" : "Scene-List";
    gridState.layout[2].type = gridState.modeToggle ? "Scene-Graph" : "Scene";
    gridState.layout[3].type = gridState.modeToggle ? "Graph" : "";
    gridState.layout[4].type = gridState.modeToggle ? "Graph-Viewer" : "Scene-Viewer";
    GridStore.emitChange();
};


addComponent = function (type) {
    gridState.layout.push(
        {
            i: hat().toString(),
            x: gridState.layout.length * 2 % 6,
            y: Infinity,
            w: 2,
            h: 2,
            _w: 2,
            _h: 2,
            type:type,
            visible: true,
            isResizeable: true,
            state: "default"
        }
    )
};
removeComponent=function(id){
    console.log(gridState.layout)
    gridState.layout.splice(_.indexOf(gridState.layout, _.findWhere(gridState.layout, { i : id})), 1);
    console.log(gridState.layout)
};

changeFocus = function (type) {
    gridState.focusedType = type;
};
var GridStore = assign({}, EventEmitter.prototype, {
    emitChange: function () {

        this.emit(CHANGE_EVENT);
    },
    focusScene: function (scene) {
        gridState.scene = scene;
        GridStore.emitChange();
    },
    focusSceneGraph: function (sceneGraph) {
        gridState.sceneGraph = sceneGraph;
        GridStore.emitChange();
    },

    // APEP TODO should be triggered from a VIEW action rather than direct store call

    getFocusedComponent: function () {
        return gridState.focusedType;
        GridStore.emitChange();
    },
    setRoomId: function (room) {
        gridState.roomId = room;
    },
    getGridState: function () {
        // APEP this fixed the issue
        return _.cloneDeep(gridState);
    },
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    // APEP every store should use the react view events + dispatcher, direct store manipulation is an anti pattern which adds complexity as it's not documented.
    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action; // this is our action from handleViewAction
        switch (action.type) {
            // should only be triggered when server sends data back, so no need to save
            case ActionTypes.COMP_MIN:
                minimize(action.index, action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_MAX:
                maximize(action.index, action.item, action.maxHeight);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_RESTORE:
                restore(action.index, action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_SWITCH_MODE:
                changeMode();
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_FOCUS_SWITCH:
                changeFocus(action.itemType);
                GridStore.emitChange();
                break;
            case ActionTypes.ADD_COMPONENT:
                addComponent(action.componentType);
                GridStore.emitChange();
                break;
            case ActionTypes.REMOVE_COMPONENT:
                removeComponent(action.componentId);
                GridStore.emitChange();
                break;
        }

        return true;
    })

});
module.exports = GridStore;
