var React = require('react');
var GridStore = require('../stores/grid-store');
var connectionCache = require('../utils/connection-cache');
var SceneActions = require('../actions/scene-actions');
var ClientStore = require('../stores/client-store');

var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var FormHelper = require('../mixins/form-helper');
var HubSendActions = require('../actions/hub-send-actions');
var HubClient = require('../utils/HubClient');
var LayoutComponentConstants = require('../constants/layout-constants').ComponentTypes;

var GraphTypes = require('../constants/graph-constants').GraphTypes;
var GraphTitles = require('../constants/graph-constants').GraphTitles;

var SceneSelector = require('./scene-selector.jsx');
var ViewLayoutActions = require("../actions/view-layout-actions");

function _getState() {
    return {
        loggedIn: ClientStore.loggedIn(),
        focusedLayoutItem: GridStore.getFocusedComponent(),
        value: GraphTypes.GDC,
        focusedSceneID: "",
        focusedSceneGraphID: ""
    }
}

var NavigationBar = React.createClass({
    mixins: [FormHelper],
    getInitialState: function () {
        return _getState();
    },

    _onLoginChange: function () {
        this.setState({loggedIn: ClientStore.loggedIn()});
    },

    _onLayoutChange: function () {
        this.setState({
            focusedLayoutItem: GridStore.getFocusedComponent(),
            focusedSceneID: GridStore.getFocusedSceneID(),
            focusedSceneGraphID: GridStore.getFocusedSceneGraphID(),
            doesHaveMaximisedComponent: GridStore.hasMaximisedView()
        });
    },

    _onOptionValueChange: function (e) {
        this.setState({value: e.target.value})
    },

    handleLogout: function (event) {
        SceneActions.logout();
    },

    addComponent: function (type) {
        ViewLayoutActions.addLayoutComponent(type);
    },

    componentDidMount: function () {

    },

    componentWillMount: function () {
        ClientStore.addChangeListener(this._onLoginChange);
        GridStore.addChangeListener(this._onLayoutChange);
    },

    handleCreateScene: function (event) {
        event.preventDefault();
        HubSendActions.tryCreateScene(this.getRefVal('name'));
    },

    handleGraphRoomChange: function (event) {
        event.preventDefault();
        HubClient.registerToGraphPlayerRoom(this.getRefVal('name'))
    },

    handleCreateSceneGraph: function (event) {
        event.preventDefault();
        HubSendActions.tryCreateSceneGraph(this.getRefVal('name'), this.state.value);
    },

    componentWillUnmount: function () {
        ClientStore.removeChangeListener(this._onLoginChange);
        GridStore.removeChangeListener(this._onLayoutChange);
    },

    // APEP TODO these components should be separate React Classes in my opinion, it would make this a lot less messy.
    getNavComponent: function () {
        switch (this.state.focusedLayoutItem) {
            case LayoutComponentConstants.SceneGraph:
                return (<li>
                    <span className="navbar-text">Scene Graph</span>
                </li>);
                break;
            case LayoutComponentConstants.SceneGraphList:
                return (<li>
                    <form className='form-inline mf-form' onSubmit={this.handleCreateSceneGraph} role='form'>
                        <label htmlFor="scene-graph-input" className="mf-text">Scene Graph List</label>
                        <input type='text' ref='name' id="scene-graph-input" className='form-control'
                               placeholder='name'/>
                        <span id="basic-addon2">
                                    <select className="form-control" ref="graphType" value={this.state.value}
                                            onChange={this._onOptionValueChange}>
                                        <option value={GraphTypes.GDC}>{GraphTitles.GDC_SCENE_GRAPH}</option>
                                        <option value={GraphTypes.MEMOIR}>{GraphTitles.MEMOIR_SCENE_GRAPH}</option>
                                        <option value={GraphTypes.NARM}>{GraphTitles.NARM_SCENE_GRAPH}</option>
                                        <option value={GraphTypes.THUMBNAIL}>{GraphTitles.THUMBNAIL_SCENE_GRAPH}</option>
                                        <option value={GraphTypes.CERAMIC}>{GraphTitles.CERAMIC_SCENE_GRAPH}</option>
                                         <option value={GraphTypes.SOUND}>{GraphTitles.SOUND_GUI}</option>
                                    </select>
                                </span>
                        <button type='submit' className='btn btn-dark'>Create</button>
                    </form>
                </li>);
                break;
            case LayoutComponentConstants.GraphViewer:
                return (<li>
                    <form className='form-inline mf-form' onSubmit={this.handleGraphRoomChange} role='form'>
                        <label htmlFor="scene-graph-input" className="mf-text">Graph Viewer</label>
                        <input type='text' ref='name' id="scene-graph-input" className='form-control'
                               placeholder='Room ID'/>
                        <button type='submit' className='btn btn-dark'>set Room</button>
                    </form>
                </li>);
                break;
            case LayoutComponentConstants.SceneViewer:
                return <li><span className="navbar-text">Scene Viewer</span></li>;
                break;
            case LayoutComponentConstants.Graph:
                return (<li>
                    <form className='form-inline mf-form' onSubmit={this.handleGraphRoomChange} role='form'>
                        <label htmlFor="scene-graph-input" className="mf-text">Graph</label>
                        <input type='text' ref='name' id="scene-graph-input" className='form-control'
                               placeholder='Room ID'/>
                        <button type='submit' className='btn btn-dark'>set Room</button>
                    </form>
                </li>);
                break;
            case LayoutComponentConstants.SceneMediaBrowser:
                return <li><span className="navbar-text">Scene Viewer</span></li>;
                break;
            case LayoutComponentConstants.SceneEditor:
                return <li><span className="navbar-text">Scene Viewer</span></li>;
                break;
            default:
                return (<li><span className="navbar-text"></span></li>); //return empty if no navbar element
                break
        }

    },
    stopPropHandler: function (e) {
        e.stopPropagation();
    },

    render: function () {
        var self = this;
        var nc = this.getNavComponent();
        var isAdmin = connectionCache.getGroupID() === 0;
        var sessionNav = null;
        var adminDropDown = null;

        if (isAdmin) {
            // APEP TODO no reason why this can't be it's own react class.
            adminDropDown = (
                <li className="mf-dropdown">
                    <DropdownButton id="admin-drop-down-for-ids" title={"Admin"} className="btn btn-dark navbar-btn">
                        <label>Focused Scene ID: </label><input onSelect={self.stopPropHandler} type="text"
                                                                value={this.state.focusedSceneID || ""}/>
                        <label>Focused Scene Graph ID: </label><input onSelect={self.stopPropHandler} type="text"
                                                                      value={this.state.focusedSceneGraphID || ""}/>
                    </DropdownButton>
                </li>
            )
        }

        if (this.state.loggedIn) {
            // APEP TODO no reason why this can't be it's own react class.  We might already have one...
            sessionNav = (   <li>
                    <p className="navbar-text">{connectionCache.getGroupID()}
                        - {connectionCache.getShortGroupName(connectionCache.getGroupID())}</p>
                </li>
            );
        }


        var navbarParentClassname = 'navbar navbar-inverse ';

        // APEP Allows the grid layout to state if we have a component that has request to be maximised.
        // In this case, we might wish to hide the nav bar
        // APEP TODO 29/11/17 this needs to be behind a user toggle from settings.
        if(this.state.doesHaveMaximisedComponent) {
            // navbarParentClassname += 'hidden';
        }

        if (this.state.loggedIn)
        // APEP TODO Tech Debt
        // APEP TODO We should add browser tool tips to the dropdown button menu to show that key bindings can be used.
        // APEP TODO we need to add an on select handler for the event keys
        // APEP TODO Look at why we have a hard coded Version: 0
        // APEP TODO A lot of these can be React classes
            return (
                <nav className={navbarParentClassname}>
                    <div className="container-fluid mf-brand-position-fix">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                    data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"/>
                                <span className="icon-bar"/>
                                <span className="icon-bar"/>
                            </button>
                        </div>
                        <div className="collapse navbar-collapse mf-brand-position-fix">
                            <ul className="nav navbar-nav navbar-left">
                                <li><img className="mf-image-logo" src="/images/salford-logo.png"/></li>
                                <li><img className="mf-image-logo" src="/images/MF_transparent.png"/></li>
                                <li>
                                <SceneSelector _sceneFocusHandler={GridStore.focusScene}></SceneSelector>
                                </li>
                            </ul>
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    <span className="navbar-text">Version: 0</span>
                                </li>
                                {sessionNav}
                                {adminDropDown}
                                <li className="mf-dropdown">
                                    <DropdownButton id="add-component-drop-down" title={"Components"}
                                                    className="btn btn-dark navbar-btn">
                                        <MenuItem divider/>
                                        <MenuItem header>Scenes</MenuItem>
                                        <MenuItem eventKey="1"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneEditor)}>Scene
                                            Editor</MenuItem>
                                        <MenuItem eventKey="2"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneMediaBrowser)}>Scene
                                            Media Browser</MenuItem>
                                        <MenuItem eventKey="3"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneEditorGUI)}>Visual
                                            Scene Editor</MenuItem>
                                        <MenuItem eventKey="4"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.TagEditor)}>Tag
                                            Editor</MenuItem>

                                        <MenuItem divider/>
                                        <MenuItem header>Graphs</MenuItem>
                                        <MenuItem eventKey="5"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneGraphList)}>Scene
                                            Graph List</MenuItem>
                                        <MenuItem eventKey="6"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneGraph)}>Scene
                                            Graph Editor</MenuItem>
                                        <MenuItem eventKey="7"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.Graph)}>Graph</MenuItem>

                                        <MenuItem divider/>
                                        <MenuItem header>Players</MenuItem>
                                        <MenuItem eventKey="8"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneViewer)}>Scene
                                            Preview Player</MenuItem>
                                        <MenuItem eventKey="9"
                                                  onClick={self.addComponent.bind(this, LayoutComponentConstants.GraphViewer)}>External
                                            Player</MenuItem>
                                    </DropdownButton>
                                </li>
                                <li>
                                    <button type="button" onClick={this.handleLogout}
                                            className='btn btn-dark navbar-btn'>
                                        Log out
                                    </button>
                                </li>
                            </ul>
                            <ul className="nav navbar-nav navbar-right">
                                {nc}
                            </ul>
                        </div>
                    </div>
                </nav>
            );
        else
            return null;

    }

});

module.exports = NavigationBar;
