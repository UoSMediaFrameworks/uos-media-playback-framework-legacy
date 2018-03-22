"use strict";
var SceneConstants = require('../constants/scene-constants');
var ActionTypes = SceneConstants.ActionTypes;
var AppDispatcher = require('../dispatchers/app-dispatcher');

var ViewLayoutActions = {

    setPreset: function(layoutPreset) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.LAYOUT_PRESET_SELECTED,
            preset: layoutPreset
        });
    },

    changeFocus:function(itemType){
        AppDispatcher.handleViewAction({
            type: ActionTypes.COMP_FOCUS_SWITCH,
            itemType: itemType
        });
    },

    layoutChange: function (layout) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.LAYOUT_CHANGE,
            layout: layout
        })
    },
    addLayoutComponent: function (componentType) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.ADD_COMPONENT,
            componentType: componentType
        })
    },

    gridDOMUpdate: function (clientHeight, numberOfRows, clientWidth) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.GRID_CONTAINER_UPDATE,
            clientHeight: clientHeight,
            clientWidth: clientWidth,
            numberOfRows: numberOfRows
        });
    },

    removeLayoutComponent: function (componentId) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.REMOVE_COMPONENT,
            componentId: componentId
        })
    },
    collapseLeft: function (item) {
        AppDispatcher.handleViewAction({
                type: ActionTypes.COMP_COLLAPSE_LEFT,
                item: item
            }
        )
    },
    collapseRight: function (item) {
        AppDispatcher.handleViewAction({
                type: ActionTypes.COMP_COLLAPSE_RIGHT,
                item: item
            }
        )
    },
    expandLeft: function (item) {
        AppDispatcher.handleViewAction({
                type: ActionTypes.COMP_EXPAND_LEFT,
                item: item
            }
        )
    },
    expandRight: function (item) {
        AppDispatcher.handleViewAction({
                type: ActionTypes.COMP_EXPAND_RIGHT,
                item: item
            }
        )
    },

    minComp: function (index, item) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.COMP_MIN,
            index: index,
            item: item
        });
    },

    maxComp: function (index, item, maxHeight) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.COMP_MAX,
            index: index,
            item: item,
            maxHeight: maxHeight
        });
    },

    // APEP isForPresentation allows a popout for presentation mode, no nav bar and better support for full page
    popoutComp: function (index, item, width, height, isForPresentation) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.COMP_POPOUT,
            index: index,
            item: item,
            width: width,
            height: height,
            isForPresentation: isForPresentation
        });
    },
    restoreComp: function (index, item) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.COMP_RESTORE,
            index: index,
            item: item
        });
    },

    switchCompMode: function () {
        AppDispatcher.handleViewAction({
            type: ActionTypes.COMP_SWITCH_MODE
        });
    },
};

module.exports = ViewLayoutActions;
