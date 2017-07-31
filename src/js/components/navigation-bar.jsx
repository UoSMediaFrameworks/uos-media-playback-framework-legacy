var React = require('react');
var GridStore = require('../stores/grid-store');
var connectionCache = require('../utils/connection-cache');
var SceneActions = require('../actions/scene-actions');
var ClientStore = require('../stores/client-store');
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;

function _getState() {
    return {
        loggedIn: ClientStore.loggedIn(),
        focusedLayoutItem:GridStore.getFocusedComponent()
    }
};

var NavigationBar = React.createClass({
    getInitialState: function () {
        return _getState();
    },
    _onLoginChange:function(){
        this.setState({loggedIn: ClientStore.loggedIn()});
    },
    _onLayoutChange:function(){
        this.setState({focusedLayoutItem: GridStore.getFocusedComponent()});
    },
    handleLogout: function (event) {
        SceneActions.logout();
    },
    addComponent:function(type){
        console.log("addComponent",type)
        SceneActions.addLayoutComponent(type);
    },
    componentDidMount:function(){

    },
    componentWillMount:function(){
        ClientStore.addChangeListener(this._onLoginChange)
        GridStore.addChangeListener(this._onLayoutChange)
    },
    componentWillUnmount:function(){
        ClientStore.removeChangeListener(this._onLoginChange)
        GridStore.removeChangeListener(this._onLayoutChange)
    },
    getNavComponent: function () {
        switch (this.state.focusedLayoutItem) {
            case "Scene":
                return <li><span  className="navbar-text">Scene</span></li>;
                break;
            case "Scene-Graph":
                return <li> <span  className="navbar-text">Scene Graph</span></li>;
                break;
            case "Scene-List":
                return  <li><span  className="navbar-text">Scene List</span></li>;
                break;
            case "Scene-Graph-List":
                return <li><span  className="navbar-text">Scene Graph List</span></li>;
                break;
            case "Graph-Viewer":
                return <li><span  className="navbar-text">Graph Viewer</span></li>;
                break;
            case "Scene-Viewer":
                return <li><span  className="navbar-text">Scene Viewer</span></li>;
                break;
            case "Graph":
                return <li><span  className="navbar-text">Graph</span></li>;
                break;
            case "":
                return null;
                break;
            default:
                return <li><span  className="navbar-text">None of the component types have been provided</span></li>    ;
                break
        }

    },
    render: function () {
        var self=this;
        var nc = this.getNavComponent();

        var sessionNav = null;
        if (this.state.loggedIn) {
            sessionNav = (   <li>

                    <p className="navbar-text">{connectionCache.getGroupID()}
                        - {connectionCache.getShortGroupName(connectionCache.getGroupID())}</p>
                </li>

            )
        }
        var title="components";
        return (
            <nav className='navbar navbar-inverse'>
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                    </div>
                    <div className="collapse navbar-collapse">
                        <ul className="nav navbar-nav navbar-left">
                            {nc}
                        </ul>
                        <ul className="nav navbar-nav navbar-right">

                            <li>
                                <span className="navbar-text">Version: 0</span>
                            </li>
                            {sessionNav}
                            <li className="mf-dropdown">
                                <DropdownButton title={title} className="btn btn-dark navbar-btn">
                                    <MenuItem eventKey="1" onClick={self.addComponent.bind(this,"Scene-List")}>Scene List</MenuItem>
                                    <MenuItem eventKey="2" onClick={self.addComponent.bind(this,"Scene")}>Scene Editor</MenuItem>
                                    <MenuItem eventKey="3" onClick={self.addComponent.bind(this,"Scene-Graph-List")}>Scene Graph List</MenuItem>
                                    <MenuItem eventKey="4" onClick={self.addComponent.bind(this,"Scene-Graph")}>Scene Graph Editor</MenuItem>
                                    <MenuItem eventKey="5" onClick={self.addComponent.bind(this,"Graph")}>Graph</MenuItem>
                                    <MenuItem eventKey="6" onClick={self.addComponent.bind(this,"Scene-Viewer")}>Scene Viewer</MenuItem>
                                    <MenuItem eventKey="7" onClick={self.addComponent.bind(this,"Graph-Viewer")}>Graph Viewer</MenuItem>
                                </DropdownButton>
                            </li>
                            <li>
                                <button type="button"    onClick={this.handleLogout}  className='btn btn-dark navbar-btn' >Log out
                                </button>
                            </li>
                        </ul>

                    </div>
                </div>
            </nav>
        )
    }

});

module.exports = NavigationBar;
