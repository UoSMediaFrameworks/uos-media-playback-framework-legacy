'use strict';
/* jshint browser: true */
/* global confirm: false */

var React = require('react');
var _ = require('lodash');
var Authentication = require('../../mixins/Authentication');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneGraphActions = require('../../actions/scene-graph-actions');
var SceneGraphStore = require('../../stores/scene-graph-store.jsx');
var SceneGraphListStore = require('../../stores/scene-graph-list-store.jsx');
var SceneListStore = require('../../stores/scene-list-store'); //scene-list-store does not return the full scene objects - I need the themes
var SceneStore = require('../../stores/scene-store');
var DragDropContainer = require('../basic-draggable/drag-drop-container.jsx');
var Router = require('react-router'),
    Link = Router.Link;

var SceneItem = React.createClass({
    render: function() {
        return <option value={this.props.scene._id}>{this.props.scene.name}</option>;
    }
});

var _selectedSceneForRemoval = undefined;

var SceneItemForList = React.createClass({

    getInitialState: function() {
        return {
            scene: this.props.scene,
            sceneGraphId: this.props.sceneGraphId
        };
    },


    onSceneItemSelected: function(event) {
        var sceneId = this.state.scene._id;
        var sceneGraphId = this.state.sceneGraphId;

        _selectedSceneForRemoval = sceneId;

        SceneGraphActions.selectSceneForSceneGraphDisplay(this.state.sceneGraphId, sceneId);
    },

    render: function() {
        return <li onClick={this.onSceneItemSelected}>{this.state.scene.name}</li>;
    }
});

var SceneGraphNodeForGraphTheme = React.createClass({
    //TODO: STORE PROPERTY KEY LIST AS PART PROPERTY LIST

    render: function() {

    }
});

var SceneGraphNode = React.createClass({
    render: function() {
        return (
            <li className={this.props.indentation}>
                <p> {this.props.node} </p>
                <ul>
                    { Object.keys(this.props.graphTheme).map(function(property){
                        return <SceneGraphNode indentation="firstLevel" graphTheme={this.props.graphTheme[property]} node={property}/>
                    }, this)}

                </ul>
            </li>
        )
    }
});

var TagItemForList = React.createClass({
    render: function() {
        return <li>{this.props.value}</li>;
    }
});

var ThemeForList = React.createClass({
    render: function() {
        return <li>{this.props.value}</li>;
    }
});

var ThemesList = React.createClass({
    render: function() {
        return (
            <div>
                { this.props.tagList.map(function(tag){
                    return <ThemeForList value={tag} />
                })}
            </div>
        )
    }
});

var SceneTheme = React.createClass({
    render: function() {
        return (
            <ul>
                { this.props.themes.map(function(theme){
                    return <ThemeForList value={theme} />
                })}
            </ul>
        )
    }
});

var _selectedScene = undefined;

var generateThemeListForSelectedScene = function(selectedScene) {
    var themes = [];

    if(!selectedScene || !selectedScene.themes)
        return themes;

    for(var property in selectedScene.themes) {
        themes.push(property);
    }

    return themes;
};

var generateTagListFromThemeList = function(selectedScene) {

    var tags = [];

    if(!selectedScene || !selectedScene.themes)
        return tags;

    for(var theme in selectedScene.themes) {
        tags.push(selectedScene.themes[theme]);
    }

    return tags;
};

var SceneGraph = React.createClass({

    mixins: [Router.State, Authentication],

    loadAllScenesForSceneGraph: function(sceneGraph) {

        var sceneIds = sceneGraph && sceneGraph.sceneIds ? Object.keys(sceneGraph.sceneIds) : [];

        for(var sceneId in sceneIds) {
            HubSendActions.loadScene(sceneIds[sceneId]);
        }

    },

    getStateFromStores: function() {
        var sceneGraph = SceneGraphStore.getSceneGraph(this.props.params.id);

        if(sceneGraph && ! this.state.sceneGraph) {
            this.loadAllScenesForSceneGraph(sceneGraph);
        }

        var selectedScene = SceneStore.getScene(_selectedSceneForRemoval);

        var state = {
            sceneGraph: sceneGraph,
            graphThemes: sceneGraph && sceneGraph.graphThemes ? sceneGraph.graphThemes : {},
            name: sceneGraph ? sceneGraph.name : "",
            sceneGraphs: SceneGraphListStore.getAll(),
            scenes: SceneListStore.getAll(),
            storedFullScenes: [],
            selectedScene: selectedScene,
            selectedSceneThemeList: generateThemeListForSelectedScene(selectedScene),
            selectSceneTags: generateTagListFromThemeList(selectedScene),
            themeUnionForScenesInGraph: {}
        };

        var sceneIds = state.sceneGraph && state.sceneGraph.sceneIds ? Object.keys(state.sceneGraph.sceneIds) : [];

        for(var sceneId in sceneIds) {
            var fullScene = SceneStore.getScene(sceneIds[sceneId]);
            if(fullScene) {
                state.storedFullScenes.push(fullScene);
            }
        }

        for(var scene in state.storedFullScenes) {
            var fullSceneObj = state.storedFullScenes[scene];
            var themeKeys = Object.keys(fullSceneObj.themes);

            var excludedThemeList = Object.keys(state.sceneGraph.excludedThemes);

            for(var property in themeKeys) {

                if(excludedThemeList.indexOf(themeKeys[property]) === -1)
                    state.themeUnionForScenesInGraph[themeKeys[property]] = {};

            }
        }

        console.log("getStateFromStores: ", state);

        return state;
    },

    componentDidMount:function(){
        SceneGraphListStore.addChangeListener(this._onChange);
        SceneGraphStore.addChangeListener(this._onChange);
        SceneListStore.addChangeListener(this._onChange);
        SceneStore.addChangeListener(this._onChange);
        HubSendActions.loadSceneGraph(this.props.params.id);
    },

    componentWillUnmount: function() {
        SceneGraphListStore.removeChangeListener(this._onChange);
        SceneGraphStore.removeChangeListener(this._onChange);
        SceneListStore.removeChangeListener(this._onChange);
        SceneStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        this.setState(this.getStateFromStores());
    },

    getInitialState: function() {
        return _.extend(this.getStateFromStores(), {});
    },

    onSceneSelected: function(event) {

        _selectedScene = event.target.value;

        HubSendActions.loadScene(_selectedScene);
    },

    addSelectedScene: function(event) {
        var selectedScene = _selectedScene;

        SceneGraphActions.addScene(this.state.sceneGraph._id, selectedScene);
    },

    removeSelectedSceneFromSceneGraphSceneList: function(event) {
        if(!_selectedSceneForRemoval) {
            return;
        }

        SceneGraphActions.removeScene(this.state.sceneGraph._id, _selectedSceneForRemoval);

        _selectedSceneForRemoval = undefined;
    },

    deleteSceneGraphHandler: function(event) {
        if(confirm('Deleting a scene graph is a permament operation.\n\nAre you sure?')) {
            HubSendActions.deleteSceneGraph(this.state.sceneGraph._id);
        }
    },

    render: function() {

        var sceneGraphId = this.state.sceneGraph ? this.state.sceneGraph._id : "";

        var viewerUrl = "http://uos-mediahubgraph.azurewebsites.net/?id=" + sceneGraphId;

        return (
            <div className="container scene-graph">

                <div className='scene-controls' style={{margin: '10px'}}>
                    <button className='btn' onClick={this.deleteSceneGraphHandler}>Delete Scene Graph</button>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <Link className='btn' to='scenegraphs'>&lt; Back to Scene Graph List</Link>
                        <h3>SceneGraph: {this.state.name}</h3>
                        <a className='btn' href={viewerUrl}>Open Graph</a>
                    </div>
                    <div className="col-md-12 scene-graph-scene-list-container">
                        <h4>Add a scene to the graph</h4>
                        <select className="form-control scene-list" onChange={this.onSceneSelected} value={this.state.selectedScene ? this.state.selectedScene._id : undefined}>
                            {this.state.scenes.map(function(sc){
                                return <SceneItem scene={sc} />;
                            })}
                        </select>
                    </div>

                    <div className="col-md-12">
                        <div className="col-md-4">
                            <button className="btn btn-info add-scene-button" onClick={this.addSelectedScene}>Add Scene</button>
                            <div className="panel panel-default scenes-themes-tags no-margin-bottom">
                                <div className="panel-heading">Scenes</div>
                                <div className="panel-body">
                                    {this.state.storedFullScenes.map(function(sc){
                                        return <SceneItemForList scene={sc} sceneGraphId={this.state.sceneGraph._id} />;
                                    }, this)}
                                </div>
                            </div>
                            <button className="btn btn-warning remove-scene-button" onClick={this.removeSelectedSceneFromSceneGraphSceneList}>Remove Scene</button>
                        </div>
                        <div className="col-md-4">
                            <div className="panel panel-default scenes-themes-tags margin-top-34">
                                <div className="panel-heading">Themes</div>
                                <div className="panel-body">
                                    <SceneTheme scene={this.state.selectedScene} themes={this.state.selectedSceneThemeList} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="panel panel-default scenes-themes-tags margin-top-34">
                                <div className="panel-heading">Tags</div>
                                <div className="panel-body">
                                    <ThemesList tagList={this.state.selectSceneTags}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-12">
                        <DragDropContainer
                            themeUnion={Object.keys(this.state.themeUnionForScenesInGraph)}
                            sceneGraph={this.state.sceneGraph}
                            graphThemes={this.state.graphThemes}>

                        </DragDropContainer>
                    </div>

                </div>
            </div>
        );
    }

});

module.exports = SceneGraph;
