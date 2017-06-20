/**
 * Created by Angel on 31/05/2017.
 */
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');
var hat = require('hat');
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
    layout: [{i: 'a', x: 0, y: 0, w: 2, h: 15, _w: 2, _h: 15, visible: true,type:"sceneList"},
        {i: 'b', x: 2, y: 0, w: 8, h: 8, _w: 8, _h: 8, visible: true,type:"scene"},
        {i: 'c', x: 2, y: 8, w: 4, h: 4, _w: 4, _h: 4, visible: true ,type:""},
        {i: 'd', x: 2, y: 12, w: 8, h: 8, _w: 8, _h: 8, visible: true,type:"sceneViewer"}]
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
    changeMode: function () {
        gridState.modeToggle = !gridState.modeToggle;
        gridState.layout[0].type = gridState.modeToggle ? "sceneGraphList" : "sceneList";
        gridState.layout[1].type = gridState.modeToggle ? "sceneGraph" : "scene";
        gridState.layout[2].type = gridState.modeToggle ? "graph" : "";
        gridState.layout[3].type = gridState.modeToggle ? "graphViewer" : "sceneViewer";
        GridStore.emitChange();
    },
    minimize:function(index,component){
        var item = _.find( gridState.layout, function (layoutItem) {
            return layoutItem.i == component.i;
        });
        item.w = 1;
        item.h = 1;
        item.visible = false;
        var newItem= {
            i: hat().toString(),
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            _w: item._w,
            _h: item._h,
            type:item.type,
            visible: false
        };
        gridState.layout[index]= newItem;
        GridStore.emitChange();
    },
    maximize:function(index,component){
        var item = _.find(gridState.layout, function (layoutItem) {
            return layoutItem.i == component.i;
        });
        item.w = 12;
        item.h = 15;

        var newItem = {
            i: hat().toString(),
            x: 0,
            y: 0,
            w: 12,
            h: 15,
            _w: item._w,
            _h: item._h,
            type:item.type,
            visible: true
        };
        gridState.layout[index]= newItem;
        console.log(newItem, gridState.layout)
     /*   gridState.layout.push(newItem);*/

        GridStore.emitChange();
    },
    restore:function(index,component){
        var item = _.find(gridState.layout, function (layoutItem) {
            return layoutItem.i == component.i;
        });
        item.w = item._w;
        item.h = item._h;
        var newItem = {
            i: hat().toString(),
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            _w: item._w,
            _h: item._h,
            type:item.type,
            visible: true
        };
        gridState.layout[index]= newItem;
        GridStore.emitChange();
    },
    setRoomId: function (room) {
        gridState.roomId = room;
    },
    getGridState: function () {
        return gridState;
    },
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }

});
module.exports = GridStore;
