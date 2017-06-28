var AppDispatcher = require('../dispatchers/app-dispatcher');
var HubClient = require('../utils/HubClient');
var ActionTypes = SceneConstants.ActionTypes;
var hat = require('hat');
var _ = require('lodash');
var objectAssign = require('object-assign');


var GraphActions = {

    startRecording:function(){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_RECORD_START
        });
    },
    pauseRecording:function(){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_RECORD_PAUSE
        });
    },
    continueRecording:function(){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_RECORD_CONTINUE
        });
    },
    finishRecording:function(){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_RECORD_FINISH
        });
    },
    clearAllBreadcrumbs:function(){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_CLEAR_ALL
        });
    },
    playBreadcrumb:function(index){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_PLAY,
            index: index
        });
    },
    traceBreadcrumb:function(index){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_TRACE,
            index: index
        });
    },
    removeBreadcrumb:function(index){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_REMOVE_CRUMBS,
            index: index
        });
    },
    addCrumb:function(event,crumb){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_ADD_CRUMB,
            event: event,
            crumbName:crumb
        });
    },
    removeCrumb:function(props){
        AppDispatcher.handleViewAction({
            type: ActionTypes.BREADCRUMBS_REMOVE_CRUMB,
            props:props
        });
    }


};
module.exports = GraphActions;
