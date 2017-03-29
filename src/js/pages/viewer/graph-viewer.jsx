'use strict';

var React = require('react');
var GraphViewerStore = require('../../stores/graph-viewer-store');
var SceneStore = require('../../stores/scene-store');
var _ = require('lodash');
var SceneActions = require('../../actions/scene-actions');
var SceneListener = require('../scene-listener.jsx');

var sceneDisplayTimeout;
var currentSceneIndex;
var delay;

var GraphViewer = React.createClass({


    getSceneIdsFromGraphViewerStore: function() {
        // APEP the shuffle has been moved inside the store, this allows us to differentiate between score and graph randomness
        return GraphViewerStore.getScenesForPlayback();
    },

    getStateFromStores: function() {

        // console.log("graph-viewer - getStateFromStores");

        return {
            scenes: this.getSceneIdsFromGraphViewerStore(),
            themes: GraphViewerStore.getThemesForPlayback(),
            activeSceneId: null,
            activeScene: null
        }
    },

    getInitialState: function() {

        // console.log("graph-viewer - getInitialState");

        return this.getStateFromStores();
    },

    _onChange: function() {

        // console.log("graph-viewer - _onChange");

        // APEP we have a new scene list
        this.setState({scenes: this.getSceneIdsFromGraphViewerStore(), themes: GraphViewerStore.getThemesForPlayback()});

        this.showScenes();

        // APEP TODO clean up the current player

        // APEP TODO select new activeSceneId and activeScene
    },

    _onSceneStoreChange: function() {

        // console.log("graph-viewer - _onSceneStoreChange");

        // if (this.state.activeSceneId && !this.state.activeScene) {
        //     // APEP Check if the have an active scene id but are missing the full scene object
        //     var activeScene = SceneStore.getScene(this.state.activeSceneId);
        //
        //     // APEP if the scene store has now loaded the intended active scene
        //     if(activeScene) {
        //         // APEP set the state so the component can update
        //         this.setState({activeScene: activeScene});
        //     }
        // }
    },

    componentDidMount: function() {
        // console.log("graph-viewer - componentDidMount");

        GraphViewerStore.addChangeListener(this._onChange);
        //SceneStore.addChangeListener(this._onSceneStoreChange);
    },

    componentWillUnmount: function() {
        GraphViewerStore.removeChangeListener(this._onChange);
        //SceneStore.removeChangeListener(this._onSceneStoreChange);
    },

    showScenes: function() {

        var sceneList = this.state.scenes;

        currentSceneIndex = 0;

        if(sceneList.length === 0) {
            // console.log("GraphViewer - showScenes - Empty scene list");
            return;
        }

        this.nextScene(true);
    },

    setTimeoutWithDelayForNextScene: function(delay) {

        // console.log("GraphViewer - setTimeoutWithDelayForNextScene with delay: ", delay);

        var self = this;
        sceneDisplayTimeout = setTimeout(function() {
            // console.log("GraphViewer - nextSceneFromDelay");
            self.nextScene(false);
        }, delay);
    },

    getRandomThemeName (scene) {
        if (! scene.themes) {
            return null;
        } else {
            return _(scene.themes).keys().sample();
        }
    },

    nextScene: function(fromStore) {

        var activeScene = this.state.activeScene;
        var currentSceneId = this.state.scenes[currentSceneIndex];

        // console.log("GraphViewer - nextScene - currentSceneIndex, currentSceneId: ", currentSceneIndex, currentSceneId);


        if (this.state.scenes.length === 0) {
            // console.log("GraphViewer - nextScene - do not change - this.state.scenes.length === 0");
            return;
        }

        // TODO : APEP maybe the theme may be changed and this could be a problem
        if((activeScene && (activeScene._id === currentSceneId)) && this.state.scenes.length === 1) {
            console.log("GraphViewer - nextScene - do not change - activeScene && activeScene._id !== currentSceneId");
            
            // APEP attempted to check if theme same but wrong
            // this.state.themeQuery === this.state.themes.length > 0 ? this.state.themes[0] : ""
            if(!fromStore)
                return;
        }

        var self = this;

        // APEP we should really do something more suitable with the react pattern here
        // var newScene = SceneStore.getScene(currentSceneId);
        SceneActions.getFullScene(currentSceneId, function(newScene){

            if(!newScene) {
                // console.log("No scene in the store");
                delay = 1000;
            } else {
                delay = (Number(newScene.sceneTransition) || 15) * 1000;
            }

            // TODO : APEP NARM allow single scenes to still use the theme, we may need to ensure that we do not restart 
            // if we have not changed scenes
            
            // if (self.state.scenes.length < 2) {
            //     console.log("GraphViewer - nextScene - no more scenes to iterate through");
            //     // APEP when we are playing just a single scene given by the graph, pass through an empty themeQuery to allow the full scene to play back
            //     self.setState({activeScene: newScene, activeSceneId: currentSceneId, themeQuery: ""});
            //     return;
            // }

            // APEP find the themeQuery, if we've been given themes, use the first one
            // if choose from the theme bucket for the scene
            var themeQuery = "";
            if  (self.state.themes && self.state.themes.length > 0) {
                themeQuery = self.state.themes[0];
            } else {
                // APEP NARM if we are missing themes and in a bucket of one, don't randomly select theme
                if(self.state.scenes.length > 1)
                    themeQuery = self.getRandomThemeName(newScene);
            }

            currentSceneIndex++;

            // APEP Loop back to first scene if we've ran out of scenes
            if(currentSceneIndex === self.state.scenes.length) {
                currentSceneIndex = 0;
            }

            if(sceneDisplayTimeout){
                // console.log("GraphViewer - clear next scene timeout request");
                clearTimeout(sceneDisplayTimeout);
            }

            self.setTimeoutWithDelayForNextScene(delay);

            // console.log("GraphViewer - nextScene - activeScene, activeSceneId: ", newScene, currentSceneId);

            self.setState({activeScene: newScene, activeSceneId: currentSceneId, themeQuery: themeQuery});
        });
    },

    render: function() {
        // console.log("graph-viewer - render - this.state.activeScene: ", this.state.activeScene);

        var sceneListener;

        if(this.state.activeSceneId)
            sceneListener = <SceneListener sceneId={this.state.activeSceneId} activeScene={this.state.activeScene} themeQuery={this.state.themeQuery} />;
        else
            sceneListener = <h2>Graph Viewer</h2>;

        return (
            <div className="graph-viewer-container">
                {sceneListener}
            </div>
        );
    }
});

module.exports = GraphViewer;

