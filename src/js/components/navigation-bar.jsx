var React = require('react');
var GridStore = require('../stores/grid-store');
var connectionCache = require('../utils/connection-cache');
var SceneActions = require('../actions/scene-actions');
var ClientStore = require('../stores/client-store');

function _getState() {
    console.log("getting state",ClientStore.loggedIn())
    return {
        loggedIn: ClientStore.loggedIn(),
        focusedLayoutItem: GridStore.getFocusedComponent()
    }
};
var NavigationBar = React.createClass({
    getInitialState: function () {
        return _getState();
    },
    _onChange:function(){
        this.setState(_getState());
    },
    handleLogout: function (event) {
        SceneActions.logout();
    },
    componentDidMount:function(){

    },
    componentWillMount:function(){
        console.log("Nvbar will mount")
        ClientStore.addChangeListener(this._onChange)
        GridStore.addChangeListener(this._onChange)
    },
    componentWillUnmount:function(){
        ClientStore.removeChangeListener(this._onChange)
        GridStore.removeChangeListener(this._onChange)
    },
    getNavComponent: function () {
        switch (this.state.focusedLayoutItem) {
            case "scene":
                return <li><span  className="navbar-text">Scene</span></li>;
                break;
            case "x":
                return <li> <span  className="navbar-text">Scene Graph</span></li>;
                break;
            case "sceneList":
                return  <li><span  className="navbar-text">Scene List</span></li>;
                break;
            case "sceneGraphList":
                return <li><span  className="navbar-text">Scene Graph List</span></li>;
                break;
            case "graphViewer":
                return <li><span  className="navbar-text">Graph Viewer</span></li>;
                break;
            case "sceneViewer":
                return <li><span  className="navbar-text">Scene Viewer</span></li>;
                break;
            case "graph":
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

        var nc = this.getNavComponent();

        var sessionNav = null;
        if (this.state.loggedIn) {
            try{
                console.log("Rendering navbar",nc,this.state,connectionCache.getGroupID(),connectionCache.getShortGroupName(connectionCache.getGroupID()))
            }catch (e){
                console.log("err",e)
            }

            sessionNav = (   <li>

                    <p className="navbar-text">{connectionCache.getGroupID()}
                        - {connectionCache.getShortGroupName(connectionCache.getGroupID())}</p>
                </li>

            )
        }
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
