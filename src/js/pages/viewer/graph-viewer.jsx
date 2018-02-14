'use strict';

var React = require('react');
var GraphViewerStore = require('../../stores/graph-viewer-store');
var FullSceneStore = require('../../stores/full-scene-store');
var _ = require('lodash');
var SceneActions = require('../../actions/scene-actions');
var SceneListener = require('../scene-listener.jsx');
var SceneThemeTourPermutations = require('../../utils/playback/scene-theme-tour-bucket-permutations');
var sceneThemeTourPermutations = new SceneThemeTourPermutations();

var async = require('async');

var sceneDisplayTimeout;
var currentTourIndex;
var delay;

var GraphViewer = React.createClass({

    getInitialState: function() {
        return this.getStateFromStores();
    },

    getStateFromStores: function() {
        // console.log("graph-viewer - getStateFromStores");
        return {
            scenes: GraphViewerStore.getScenesForPlayback(),
            themes: GraphViewerStore.getThemesForPlayback(),
            activeSceneId: null,
            activeScene: null,
            sceneThemeTourList: [],
        }
    },

    // APEP given a list of scene ids, we can return the full scene objects
    getFullScenesForPlayback: function(scenes, callback) {

        // APEP function to collect a full scene either from scene store, if available or load in from asset store
        function getFullScene(sceneId, cb) {
            // APEP we first try load it from the store, as this front end cache hugely improves performance
            var sceneFromStore = FullSceneStore.getScene(sceneId);

            // APEP if we don't have it preloaded, we must load from the API.  This subsequently adds to front end cache
            // Allowing the player next time to load from local cache
            if(!sceneFromStore) {
                SceneActions.getFullScene(sceneId, function(newScene) {
                    cb(null, newScene);
                });
            } else {
                cb(null, sceneFromStore);
            }
        }

        var taskObject = {};

        // APEP create a task list for the async library to load all the scenes in parallel
        _.each(scenes, function(sceneId, index) {
            taskObject[index] = getFullScene.bind(null, sceneId);
        });

        async.parallel(taskObject, function (err, results) {
            if(err) {
                callback([]);
            }

            var fullScenes = [];

            // APEP collect each tasks result and combine back into a single list
            _.each(Object.keys(results), function(key){
                var scene = results[key];
                fullScenes.push(scene);
            });

            callback(fullScenes);
        });
    },
    componentWillMount:function(){
        var obj = GraphViewerStore.getLastActive();
        this.setState(obj);
    },
    // APEP we have a new scene / theme list from the graph
    _onChange: function() {

        // Missing comment
        var hex= '#' + Math.floor(Math.random()*16777215).toString(16);

        var scenes = GraphViewerStore.getScenesForPlayback();
        var themes = GraphViewerStore.getThemesForPlayback();

        var self = this;

        // APEP we must collect all the full scenes to allow our tour logic to correctly create all the matches
        this.getFullScenesForPlayback(scenes, function(fullScenes){

            var permutations = [];

            var playFullScenesOnly = GraphViewerStore.getPlayFullScenesOpt();
            var tourThemes = GraphViewerStore.getThemeTourOpt();

            // APEP with the full scenes loaded, we can appropriately create a tour of these values
            if(playFullScenesOnly) {
                permutations = sceneThemeTourPermutations.generateOnlyScenes(fullScenes);
            } else if(tourThemes && themes.length > 0) {
                permutations = sceneThemeTourPermutations.generatePermutationsGivenScenesAndThemes(fullScenes, themes);
            } else if(themes.length > 0) {
                permutations = sceneThemeTourPermutations.generateMergedScenesAndThemes(fullScenes, themes);
            } else {
                permutations = sceneThemeTourPermutations.generatePermutationsGivenOnlyScenes(fullScenes);
            }

            permutations = _.shuffle(permutations);

            var newState = {
                scenes: scenes,
                themes: themes,
                hex: hex,
                sceneThemeTourList: permutations
            };

            self.setState(newState);
            self.showScenes();
        });
    },

    componentWillReceiveProps:function(nextProps) {
        if(this.props._id !== nextProps._id){
            this.setState({activeSceneId:nextProps._id})
        }
    },

    componentDidMount: function() {
        GraphViewerStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        GraphViewerStore.removeChangeListener(this._onChange);
    },

    showScenes: function() {

        var tourList = this.state.sceneThemeTourList;

        currentTourIndex = 0;

        if(tourList.length === 0) {
            console.log("GraphViewer - showScenes - Empty sceneThemeTourList list");
            return;
        }

        this.nextScene();
    },

    setTimeoutWithDelayForNextScene: function(delay) {
        var self = this;
        sceneDisplayTimeout = setTimeout(function() {
            self.nextScene();
        }, delay);
    },

    getRandomThemeName (scene) {
        if (! scene.themes) {
            return null;
        } else {
            return _(scene.themes).keys().sample();
        }
    },

    nextScene: function() {

        var activeScene = this.state.activeScene;

        var currentTour = this.state.sceneThemeTourList[currentTourIndex];

        if (this.state.sceneThemeTourList.length === 0) {
            console.log("GraphViewer - nextScene - do not change - this.state.sceneThemeTourList.length === 0");
            return;
        }

        // APEP TODO Review if required to check to see if we are still on same tour scene + theme
        // As this function moves us a long for the next time this is called, if currentTour.scene and activeScene are the same, we have not traversed the list

        var newScene = currentTour.scene;

        if(!newScene) {
            delay = 1000;
        } else {
            delay = (Number(newScene.sceneTransition) || 15) * 1000;
        }

        // if (self.state.sceneThemeTourList.length < 2) {
        //     console.log("GraphViewer - nextScene - only a single bucket is provided - when we are playing just a single scene-theme, pass through an empty themeQuery to allow the full scene to play back");
        //     // APEP when we are playing just a single scene-theme, pass through an empty themeQuery to allow the full scene to play back
        //     self.setState({activeScene: newScene, activeSceneId: newScene._id, themeQuery: ""});
        //     return;
        // }

        var themeQuery = currentTour.theme;

        // APEP increment counter to next bucket
        currentTourIndex++;

        // APEP Loop back to first permutation if we've ran out
        if(currentTourIndex === this.state.sceneThemeTourList.length) {
            currentTourIndex = 0;
        }

        if(sceneDisplayTimeout){
            clearTimeout(sceneDisplayTimeout);
        }

        this.setTimeoutWithDelayForNextScene(delay);

        console.log("GraphViewer - nextScene - activeScene, activeSceneId: ", newScene, newScene._id);
        var obj ={activeScene: newScene, activeSceneId: newScene._id, themeQuery: themeQuery};
        GraphViewerStore.updateLastActive(obj);
        this.setState(obj);
    },

    render: function() {
        // console.log("graph-viewer - render - this.state.activeScene: ", this.state.activeScene);

        var sceneListener;

        if(this.state.activeSceneId)
            sceneListener = <SceneListener sceneId={this.state.activeSceneId} sceneViewer={false} activeScene={this.state.activeScene} themeQuery={this.state.themeQuery} />;
        else
            sceneListener = <span/>;

        var randomHex = this.state.hex;
        return (
            <div className="mf-graph-viewer">
                {sceneListener}
                <div style={{position:"fixed",width:"15px",height:"15px",top:"0",right:"0",backgroundColor:randomHex || "#cc0008"}}></div>
            </div>
        );
    }
});

module.exports = GraphViewer;

