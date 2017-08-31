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

var defaultComponents = [
    {
        i: 'a',
        x: 0,
        y: 1,
        w: 10,
        h: 16,
        _w: 10,
        _h: 16,
        isResizable: true,
        visible: true,
        type: "Scene-List",
        state: "default"
    },
    {
        i: 'b',
        x:10,
        y: 1,
        w: 20,
        h: 8,
        _w: 20,
        _h: 8,
        isDraggable: true,
        isResizable: true,
        visible: true,
        type: "Scene",
        state: "default"
    },
    {
        i: 'd',
        x: 10,
        y: 12,
        w: 20,
        h: 8,
        _w: 20,
        _h: 8,
        isResizable: true,
        visible: true,
        type: "Scene-Viewer",
        state: "default"
    }];



var getLayoutFromLS = function () {

    var parsedLayout = JSON.parse(localStorage.getItem('layout')) || [];
    if (parsedLayout.length < 1) {
        return defaultComponents;
    } else {
        return parsedLayout;
    }
};
var saveToLS = function (newLayout) {
    _.each(newLayout, function (item) {
        if (item.state == "default") {
            item._w = item.w;
            item._h = item.h;
        }
    });
    gridState.layout = newLayout;
    localStorage.setItem("layout", JSON.stringify(newLayout))
};

var gridState = {
    scene: {
        name: "",
        _id: null
    },
    sceneGraph: {
        name: "",
        _id: null
    },
    cols: 30,
    roomId: "presentation1",
    modeToggle: true,
    focusedType: null,
    focusedMediaObject:null,
    layout: getLayoutFromLS()
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

};

var maximize = function (index, component, maxHeight) {
    _.each(gridState.layout, function (layoutItem) {
        layoutItem.visible = false;
    });
    var item = _.find(gridState.layout, function (layoutItem) {
        return layoutItem.i == component.i;
    });
    item.w = gridState.cols;
    item.h = maxHeight;
    item.state = "max";
    item.visible = true;
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
    item.state = "default";
};
collapseLeft = function (component) {
    var item = _.find(gridState.layout, function (layoutItem) {
        return layoutItem.i == component.i;
    });
    item.state = "collapsed-left";
    item._w = item.w;
    item.w = 1;
    item.isResizable = false;

},
collapseRight = function (component) {
    var item = _.find(gridState.layout, function (layoutItem) {
        return layoutItem.i == component.i;
    });
    item.state = "collapsed-right";
    item._w = item.w;
    item.w = 1;
    item.x = (gridState.cols - item.w);
    item.isResizable = false;
},
expandLeft = function (component) {
    var item = _.find(gridState.layout, function (layoutItem) {
        return layoutItem.i == component.i;
    });
    item.state = "default";
    item.w = item._w;
    item.isResizable = true;

},
expandRight = function (component) {
        var item = _.find(gridState.layout, function (layoutItem) {
            return layoutItem.i == component.i;
        });
        item.state = "default";
        item.w = item._w;
        item.x = (gridState.cols - item._w);
        item.isResizable = true;
    },
addComponent = function (type) {

        gridState.layout.push(
            {
                i: hat().toString(),
                x: gridState.layout.length * 10 % gridState.cols,
                y: Infinity,
                w: gridState.cols/3,
                h: 15,
                _w: gridState.cols/3,
                _h: 15,
                type: type,
                visible: true,
                isResizable: true,
                state: "default"
            }
        )
    };
removeComponent = function (id) {
    gridState.layout.splice(_.indexOf(gridState.layout, _.findWhere(gridState.layout, {i: id})), 1);
};

changeFocus = function (type) {
    gridState.focusedType = type;
};
changeMediaObjectFocus = function(index){
    gridState.focusedMediaObject = index;
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
    },
    getFocusedSceneID: function () {
        return gridState.scene._id;
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
            case ActionTypes.COMP_COLLAPSE_LEFT:
                collapseLeft(action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_COLLAPSE_RIGHT:
                collapseRight(action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_EXPAND_LEFT:
                expandLeft(action.item);
                GridStore.emitChange();
                break;
            case ActionTypes.COMP_EXPAND_RIGHT:
                expandRight(action.item);
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
                addComponent(action.componentType);
                GridStore.emitChange();
                break;
            case ActionTypes.REMOVE_COMPONENT:
                removeComponent(action.componentId);
                GridStore.emitChange();
                break;
            case ActionTypes.LAYOUT_CHANGE:
                saveToLS(action.layout);
                GridStore.emitChange();
                break;

        }

        return true;
    })

});
module.exports = GridStore;
