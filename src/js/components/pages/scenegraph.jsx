'use strict';
/* jshint browser: true */
/* global confirm: false */
var CategoryConfigGenerator = require("../../utils/scene-graph/category-config-generator");
var React = require('react');
var _ = require('lodash');
var Panel = require('react-bootstrap').Panel;
var Button = require('react-bootstrap').Button;
var HubSendActions = require('../../actions/hub-send-actions');
var SceneGraphActions = require('../../actions/scene-graph-actions');
var SceneGraphStore = require('../../stores/scene-graph-store.jsx');
var SceneGraphListStore = require('../../stores/scene-graph-list-store.jsx');
var SceneListStore = require('../../stores/scene-list-store'); //scene-list-store does not return the full scene objects - I need the themes
var SceneStore = require('../../stores/scene-store');
var DragDropContainer = require('../basic-draggable/drag-drop-container.jsx');
var GraphTypes = require('../../constants/graph-constants').GraphTypes;
var mediaHubGraphURL = process.env.MEDIA_HUB_GRAPH_URL || "";

var SceneItem = React.createClass({
    render: function () {
        return <option value={this.props.scene._id}>{this.props.scene.name}</option>;
    }
});

var SceneItemForList = React.createClass({

    getInitialState: function () {
        return {
            scene: this.props.scene,
            sceneGraphId: this.props.sceneGraphId
        };
    },


    onSceneItemSelected: function (event) {
        var sceneId = this.state.scene._id;

        this.props.handleSceneItemForSelection(sceneId);

        SceneGraphActions.selectSceneForSceneGraphDisplay(this.state.sceneGraphId, sceneId);
    },

    render: function () {
        return <li onClick={this.onSceneItemSelected}>{this.state.scene.name}</li>;
    }
});

var SceneGraphNode = React.createClass({
    render: function () {
        return (
            <li className={this.props.indentation}>
                <p> {this.props.node} </p>
                <ul>
                    {Object.keys(this.props.graphTheme).map(function (property) {
                        return <SceneGraphNode indentation="firstLevel" graphTheme={this.props.graphTheme[property]}
                                               node={property}/>
                    }, this)}

                </ul>
            </li>
        )
    }
});

var ThemeForList = React.createClass({
    render: function () {
        return <li>{this.props.value}</li>;
    }
});

var ThemesList = React.createClass({
    render: function () {
        return (
            <div>
                {this.props.tagList.map(function (tag) {
                    return <ThemeForList key={tag} value={tag}/>
                })}
            </div>
        )
    }
});

var SceneTheme = React.createClass({
    render: function () {
        return (
            <ul>
                {this.props.themes.map(function (theme) {
                    return <ThemeForList key={this.props.scene._id + "_" + theme} value={theme}/>
                }.bind(this))}
            </ul>
        )
    }
});
var CategoryConfig = React.createClass({
    handleKeyPress: function (obj, event) {
        var self = this;
        if (event.key === 'Enter') {
            obj.alias = event.target.value;
            SceneGraphActions.updateSceneGraph(self.props.sceneGraph)
        }

    },
    renderConfig: function () {
        var self = this;
        if (!self.props.sceneGraph.categoryConfig) {
            return null;
        }

        return (
            <div>
                <h4>Row Categories:</h4>
                <ul>
                    <li><label>{"name : alias"}</label></li>
                    {self.props.sceneGraph.categoryConfig.rowHeaders.map(function (row) {
                        return <li><label>{row.name + ":" + row.alias || ""}</label><input type="text"
                                                                                           onKeyPress={self.handleKeyPress.bind(this, row)}/>
                        </li>
                    }.bind(this))}
                </ul>
                <h4>Column Categories:</h4>
                <ul>
                    <li><label>{"name : alias"}</label></li>
                    {self.props.sceneGraph.categoryConfig.columnHeaders.map(function (col) {
                        return <li><label>{col.name + ":" + col.alias || ""}</label><input type="text"
                                                                                           onKeyPress={self.handleKeyPress.bind(this, col)}/>
                        </li>
                    }.bind(this))}
                </ul>
            </div>)
    },
    render: function () {
        if (!this.props.sceneGraph) {
            return null;
        }
        try {
            if (this.props.sceneGraph.type === GraphTypes.SOUND) {
                var config = this.renderConfig();
                return (
                    <div className={"sound-gui-categories col-md-12"}>
                        <div className="panel panel-default scenes-sound-config">
                            <div className="panel-heading">Category Config</div>
                            <div className="panel-body">
                                {config}
                                <button className="btn btn-info add-scene-button" onClick={this.exportCatConfig}>Export
                                    Category
                                    Config
                                </button>
                            </div>
                        </div>
                    </div>
                )
            } else {
                return null;
            }
        } catch (E) {
            console.log("conf err", E);
            return null;
        }
    }
});
var generateThemeListForSelectedScene = function (selectedScene) {
    var themes = [];

    if (!selectedScene || !selectedScene.themes)
        return themes;
    for (var property in selectedScene.themes) {
        themes.push(property);
    }
    return themes;
};

var generateTagListFromThemeList = function (selectedScene) {

    var tags = [];

    if (!selectedScene || !selectedScene.themes)
        return tags;

    for (var theme in selectedScene.themes) {
        tags.push(selectedScene.themes[theme]);
    }

    return tags;
};

var SceneGraph = React.createClass({

    loadAllScenesForSceneGraph: function (sceneGraph) {

        var sceneIds = sceneGraph && sceneGraph.sceneIds ? Object.keys(sceneGraph.sceneIds) : [];

        for (var sceneId2 in sceneIds) {
            HubSendActions.loadScene(sceneIds[sceneId2]);
        }

    },

    getStateFromStores: function () {
        //TODO: Imrpove this condition statement
        console.log(new Date())
        try {
            var sceneGraphId = null;
            if (this.props._id) {
                sceneGraphId = this.props._id;
            }
            if (this.props.params) {
                sceneGraphId = this.props.params.id;
            }
            var sceneGraph = SceneGraphStore.getSceneGraph(sceneGraphId);
            if (sceneGraph && this.state && !this.state.sceneGraph) {
                this.loadAllScenesForSceneGraph(sceneGraph);
            }

            var selectedScene = this.state && this.state.selectedSceneId ? SceneStore.getScene(this.state.selectedSceneId) : null;
            var panelOpen = this.state && this.state.hasOwnProperty("open") ? this.state.open : false;
            var state = {
                sceneGraph: sceneGraph,
                graphThemes: sceneGraph && sceneGraph.graphThemes ? sceneGraph.graphThemes : {},
                name: sceneGraph ? sceneGraph.name : "",
                sceneGraphs: SceneGraphListStore.getAll(),
                scenes: SceneListStore.getAll(),
                storedFullScenes: {},
                selectedScene: selectedScene,
                selectedSceneThemeList: generateThemeListForSelectedScene(selectedScene),
                selectSceneTags: generateTagListFromThemeList(selectedScene),
                themeUnionForScenesInGraph: {},
                open: panelOpen
            };

            var sceneIds = state.sceneGraph && state.sceneGraph.sceneIds ? Object.keys(state.sceneGraph.sceneIds) : [];

            for (var sceneIdFromlist in sceneIds) {
                var fullScene = SceneStore.getScene(sceneIds[sceneIdFromlist]);
                if (fullScene) {
                    var storedFullScenes = state.storedFullScenes;
                    storedFullScenes[fullScene._id] = fullScene;
                    state.storedFullScenes = storedFullScenes;
                }
            }

            for (var sceneKey in Object.keys(state.storedFullScenes)) {
                var fullSceneObj = state.storedFullScenes[Object.keys(state.storedFullScenes)[sceneKey]];
                var themeKeys = Object.keys(fullSceneObj.themes);

                var excludedThemeList = Object.keys(state.sceneGraph.excludedThemes);

                for (var property in themeKeys) {
                    if (excludedThemeList.indexOf(themeKeys[property]) === -1)
                        state.themeUnionForScenesInGraph[themeKeys[property]] = {};
                }
            }

            console.log("SceneGraph - getStateFromStores: ", state);

            return state;
        } catch (e) {
            console.log("err ", state);
        }

    },

    componentDidMount: function () {
        var sceneGraphId = null;
        if (this.props._id) {
            sceneGraphId = this.props._id;
        }
        if (this.props.params) {
            sceneGraphId = this.props.params.id;
        }
        SceneGraphListStore.addChangeListener(this._onChange);
        SceneGraphStore.addChangeListener(this._onChange);
        SceneListStore.addChangeListener(this._onChange);
        SceneStore.addChangeListener(this._onChange);
        HubSendActions.loadSceneGraph(sceneGraphId);
    },
    componentWillReceiveProps: function (nextProps) {
        if (!_.isEqual(this.props._id, nextProps._id)) {
            HubSendActions.loadSceneGraph(nextProps._id);
        }
    },
    componentWillUnmount: function () {
        SceneGraphListStore.removeChangeListener(this._onChange);
        SceneGraphStore.removeChangeListener(this._onChange);
        SceneListStore.removeChangeListener(this._onChange);
        SceneStore.removeChangeListener(this._onChange);
    },

    _onChange: function () {
        this.setState(this.getStateFromStores());
    },

    getInitialState: function () {
        return _.extend(this.getStateFromStores(), {});
    },

    changeSceneSelection: function (selectedSceneId) {
        this.setState({"selectedSceneId": selectedSceneId});
    },

    onSceneSelected: function (event) {
        var selectedSceneId = event.target.value;
        HubSendActions.loadScene(selectedSceneId);
        this.changeSceneSelection(selectedSceneId);
    },
    exportCatConfig: function () {

    },
    addSelectedScene: function (event) {
        SceneGraphActions.addScene(this.state.sceneGraph._id, this.state.selectedSceneId);
    },

    removeSelectedSceneFromSceneGraphSceneList: function (event) {
        if (!this.state.selectedSceneId) {
            return;
        }

        SceneGraphActions.removeScene(this.state.sceneGraph._id, this.state.selectedSceneId);

        this.setState({selectedScene: undefined, selectedSceneId: undefined});
    },

    deleteSceneGraphHandler: function (event) {
        if (confirm('Deleting a scene graph is a permament operation.\n\nAre you sure?')) {
            HubSendActions.deleteSceneGraph(this.state.sceneGraph._id);
        }
    },

    render: function () {
        var sceneGraphId = null;
        if (this.props.params) {
            sceneGraphId = this.props.params.id;
        }
        if (this.props._id) {
            sceneGraphId = this.props._id;
        }
        var viewerUrl = mediaHubGraphURL + "/?id=" + sceneGraphId;
        if (!this.state.sceneGraph) {
            return (
                <div>
                    Scene graph has not been selected
                </div>
            );
        }
        return (
            <div className="scene-graph">
                <div>
                    <div className="col-md-12">
                        <button className='btn btn-danger' style={{"float": "right"}}
                                onClick={this.deleteSceneGraphHandler}>Delete Scene Graph
                        </button>
                        <h3 className="scene-graph-title">SceneGraph:{this.state.name}</h3>
                    </div>
                    <div className="col-md-12 scene-graph-scene-list-container">
                        <h4 style={{float: "left"}}>Add a scene to the graph</h4>
                        <select className="form-control scene-list" onChange={this.onSceneSelected}
                                value={this.state.selectedSceneId}>
                            {this.state.scenes.map(function (sc) {
                                return <SceneItem key={sc._id} scene={sc}/>;
                            })}
                        </select>
                    </div>


                    <div className="col-md-12">

                        <Button onClick={() => this.setState({open: !this.state.open})}>
                            Add, remove and view scenes for the scene graph
                        </Button>

                        <Panel collapsible expanded={this.state.open}>

                            <div className="no-side-padding col-md-4">
                                <button className="btn btn-info add-scene-button" onClick={this.addSelectedScene}>Add
                                    Scene
                                </button>
                                <div className="panel panel-default scenes-themes-tags no-margin-bottom">
                                    <div className="panel-heading">Scenes</div>
                                    <div className="panel-body">
                                        {Object.keys(this.state.storedFullScenes).map(function (sceneIdKey) {
                                            var sc = this.state.storedFullScenes[sceneIdKey];
                                            return <SceneItemForList scene={sc} key={sc._id}
                                                                     sceneGraphId={this.state.sceneGraph._id}
                                                                     handleSceneItemForSelection={this.changeSceneSelection}/>;
                                        }, this)}
                                    </div>
                                </div>
                                <button className="btn btn-warning remove-scene-button"
                                        onClick={this.removeSelectedSceneFromSceneGraphSceneList}>Remove Scene
                                </button>
                            </div>
                            <div className="col-md-4">
                                <div className="panel panel-default scenes-themes-tags">
                                    <div className="panel-heading">Themes</div>
                                    <div className="panel-body">
                                        <SceneTheme scene={this.state.selectedScene}
                                                    themes={this.state.selectedSceneThemeList}/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 no-side-padding">
                                <div className="panel panel-default scenes-themes-tags">
                                    <div className="panel-heading">Tags</div>
                                    <div className="panel-body">
                                        <ThemesList tagList={this.state.selectSceneTags}/>
                                    </div>
                                </div>
                            </div>
                        </Panel>

                    </div>

                    <CategoryConfig sceneGraph={this.state.sceneGraph}/>
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
