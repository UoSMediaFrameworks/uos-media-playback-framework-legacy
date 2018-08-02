'use strict';
/*jshint browser: true */
//REMOVE ALL NON VIEWER CODE for PERF.

var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var IndexRoute = require('react-router').IndexRoute;
var hashHistory  = require('react-router').hashHistory;
var HubSendActions = require('./actions/hub-send-actions');
var PresentationLayoutApp = require('./pages/presentation-layout-app.jsx');
var ClientStore = require('./stores/client-store');
var appVersion = require('./utils/app-version');
var SceneListener = require('./pages/scene-listener.jsx')
var GraphTest = require('./components/graphs/index.jsx')
var GraphViewer = require("./pages/viewer/graph-viewer.jsx");

// precache version data
appVersion.getVersion();

function AuthAndGetContent(xprops) {
    var sourceDomain = new URL(getParentUrl()).hostname; //MK we should probably log the actual page somewhere
    if (!ClientStore.loggedIn() && sourceDomain != null) {
        HubSendActions.tryPublicAuth({
            publicContentKey: xprops.publicContentKey,
            sourceDomain: sourceDomain,
            roomID: xprops.roomID || null
        }, function (roomID, contentRef) {
            console.log("CREF", contentRef)
            if(xprops.onRoomAssigned) {
                xprops.onRoomAssigned(roomID) //let the parent page know what room its been given
            } 
            hashHistory.push({
                pathname: '/' + contentRef.type,
                state: {
                    roomID: xprops.roomID || roomID, //use client provided room ID first if possible.
                    contentID: contentRef.id
                }
            });
        })
    }
    return;
}

function getParentUrl() {
    var isInIframe = (parent !== window),
        parentUrl = null;

    if (isInIframe) {
        parentUrl = document.referrer;
    }

    return parentUrl;
}

ReactDOM.render(
    (<Router history={hashHistory}>
        <Route path="/" component={PresentationLayoutApp} onEnter={() => AuthAndGetContent(window.xprops)}>
            <IndexRoute component={() => <div>Test</div>}/>
            <Route name="graph" path="graph" component={(props) => <GraphTest isLayout={true} _id={props.location.state.contentID}/>}/>
            <Route name="sceneview" path="sceneview" component={(props) => <SceneListener sceneId={props.location.state.contentID} sceneViewer={true}/>}/>
            <Route name="graphview" path="graphview" component={(props) => <GraphViewer isLayout={true} roomId={props.location.state.roomID}/>}/>
        </Route>
    </Router> ), document.getElementById('main')
   );