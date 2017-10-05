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

function _getState() {
    return {
        loggedIn: ClientStore.loggedIn(),
        focusedLayoutItem:GridStore.getFocusedComponent(),
        isPoppedOut:GridStore.getPoppedOut(),
        value:"GDC_SCENE_GRAPH",
        focusedSceneID: "",
        focusedSceneGraphID:""
    }
};

var NavigationBar = React.createClass({
    mixins: [FormHelper],
    getInitialState: function () {
        return _getState();
    },
    _onLoginChange:function(){
        this.setState({loggedIn: ClientStore.loggedIn()});
    },
    _onLayoutChange:function(){
        this.setState({
            focusedLayoutItem: GridStore.getFocusedComponent(),
            focusedSceneID:GridStore.getFocusedSceneID(),
            focusedSceneGraphID:GridStore.getFocusedSceneGraphID()
        });
    },
    _onOptionValueChange:function(e){
        this.setState({value:e.target.value})
    },
    handleLogout: function (event) {
        SceneActions.logout();
    },
    addComponent:function(type){
        SceneActions.addLayoutComponent(type);
    },
    componentDidMount:function(){

    },
    componentWillMount:function(){
        ClientStore.addChangeListener(this._onLoginChange);
        GridStore.addChangeListener(this._onLayoutChange);
    },
    handleCreateScene:function(event){
        event.preventDefault();
        HubSendActions.tryCreateScene(this.getRefVal('name'));
    },

    handleGraphRoomChange:function(event){
        event.preventDefault();
        HubClient.registerToGraphPlayerRoom(this.getRefVal('name'))
    },

    handleCreateSceneGraph:function(event){
        event.preventDefault();
        HubSendActions.tryCreateSceneGraph(this.getRefVal('name'), this.state.value);
    },

    componentWillUnmount:function(){
        ClientStore.removeChangeListener(this._onLoginChange);
        GridStore.removeChangeListener(this._onLayoutChange);
    },

    // APEP TODO these components should be separate React Classes in my opinion, it would make this a lot less messy.
    getNavComponent: function () {
        switch (this.state.focusedLayoutItem) {
/*            case "Scene":
                return <li><span  className="navbar-text">Scene</span></li>;
                break;*/
            case "Scene-Graph":
                return <li>
                    <span  className="navbar-text">Scene Graph</span>

                </li>;
                break;
            case "Scene-List":
                return  <li>
                    <form className='form-inline mf-form' onSubmit={this.handleCreateScene} role='form'>
                        <div className='form-group mf-input'>
                            <label htmlFor="scene-input"  className="mf-text">Scene List</label>
                            <input type='text' ref='name' id="scene-input" className='form-control' placeholder='name'/>
                        </div>
                        <button type='submit' className='btn btn-dark'>Create</button>
                    </form>
                </li>;
                break;
            case "Scene-Graph-List":
                return <li>
                    <form className='form-inline mf-form' onSubmit={this.handleCreateSceneGraph} role='form'>
                            <label htmlFor="scene-graph-input"  className="mf-text">Scene Graph List</label>
                            <input type='text' ref='name' id="scene-graph-input" className='form-control' placeholder='name'/>
                            <span id="basic-addon2">
                                    <select className="form-control" ref="graphType" value={this.state.value}
                                            onChange={this._onOptionValueChange}>
                                        <option value="GDC_SCENE_GRAPH">GDC</option>
                                        <option value="MEMOIR_SCENE_GRAPH">Memoir</option>
                                        <option value="NARM_SCENE_GRAPH">NARM</option>
                                    </select>
                                </span>
                            <button type='submit' className='btn btn-dark'>Create</button>
                    </form>
                </li>;
                break;
            case "Graph-Viewer":
                return <li>
                    <form className='form-inline mf-form' onSubmit={this.handleGraphRoomChange} role='form'>
                        <label htmlFor="scene-graph-input"  className="mf-text">Graph Viewer</label>
                        <input type='text' ref='name' id="scene-graph-input" className='form-control' placeholder='Room ID'/>
                        <button type='submit' className='btn btn-dark'>set Room</button>
                    </form>
                </li>
                break;
            case "Scene-Viewer":
                return <li><span  className="navbar-text">Scene Viewer</span> <span classname="navbar-text"> </span></li>;
                break;
            case "Graph":
                return <li>
                    <form className='form-inline mf-form' onSubmit={this.handleGraphRoomChange} role='form'>
                        <label htmlFor="scene-graph-input"  className="mf-text">Graph</label>
                        <input type='text' ref='name' id="scene-graph-input" className='form-control' placeholder='Room ID'/>
                        <button type='submit' className='btn btn-dark'>set Room</button>
                    </form>
                </li>;
                break;
            case "Scene-Media-Browser":
                return <li><span  className="navbar-text">Scene Viewer</span></li>
                    break;
            case "Scene-Editor":
                return <li><span  className="navbar-text">Scene Viewer</span></li>
                    break;
            case "":
                return null;
                break;
            default:
                return <li><span  className="navbar-text">None of the component types have been provided</span></li>    ;
                break
        }

    },
    stopPropHandler:function(e){
      e.stopPropagation();
    },
    render: function () {
        var self = this;
        var nc = this.getNavComponent();
        var isAdmin = connectionCache.getGroupID() === 0;
        var sessionNav = null;
        var adminDropDown = null;

        if(isAdmin){
            // APEP TODO no reason why this can't be it's own react class.
            adminDropDown = (
            <li className="mf-dropdown">
                <DropdownButton id="admin-drop-down-for-ids" title={"Admin"} className="btn btn-dark navbar-btn" >
                    <label>Focused Scene ID: </label><input onSelect={self.stopPropHandler}  type="text" value={this.state.focusedSceneID || ""}/>
                    <label>Focused Scene Graph ID: </label><input  onSelect={self.stopPropHandler} type="text" value={this.state.focusedSceneGraphID || ""}/>
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

         if(this.state.loggedIn && !this.state.isPoppedOut)
             // APEP TODO We should add browser tool tips to the dropdown button menu to show that key bindings can be used.
             // APEP TODO Look at why we have a hard coded Version: 0
             // APEP TODO A lot of these can be React classes
             return (
                 <nav className='navbar navbar-inverse'>
                     <div className="container-fluid">
                         <div className="navbar-header">
                             <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                     data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                 <span className="sr-only">Toggle navigation</span>
                                 <span className="icon-bar"/>
                                 <span className="icon-bar"/>
                                 <span className="icon-bar"/>
                             </button>
                         </div>
                         <div className="collapse navbar-collapse">
                             <ul className="nav navbar-nav navbar-left">
                                 <li><img className="mf-image-logo" src="/images/salford-logo.png"/></li>
                                 <li><img className="mf-image-logo" src="/images/MF_transparent.png"/></li>
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
                                         <MenuItem eventKey="1"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneList)}>Scene
                                             List</MenuItem>
                                         <MenuItem eventKey="3"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneGraphList)}>Scene
                                             Graph List</MenuItem>
                                         <MenuItem eventKey="4"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneGraph)}>Scene
                                             Graph Editor</MenuItem>
                                         <MenuItem eventKey="5"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.Graph)}>Graph</MenuItem>
                                         <MenuItem eventKey="6"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneViewer)}>Scene
                                             Viewer</MenuItem>
                                         <MenuItem eventKey="7"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.GraphViewer)}>Graph
                                             Viewer</MenuItem>
                                         <MenuItem eventKey="8"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneEditor)}>Scene
                                             Editor</MenuItem>
                                         <MenuItem eventKey="9"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneMediaBrowser)}>Scene
                                             Media Browser</MenuItem>
                                         <MenuItem eventKey="e"
                                                   onClick={self.addComponent.bind(this, LayoutComponentConstants.SceneEditorGUI)}>Visual
                                             Scene Editor</MenuItem>
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
