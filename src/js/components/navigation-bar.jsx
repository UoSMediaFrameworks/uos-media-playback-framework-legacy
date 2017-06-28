var React = require('react');
var GridStore = require('../stores/grid-store');
var connectionCache = require('../utils/connection-cache');
var SceneActions = require('../actions/scene-actions');

var NavigationBar = React.createClass({
    getInitialState: function () {
        return {
            focusedLayoutItem: null
        }
    },
    _onChange:function(){
        var test =GridStore.getFocusedComponent();
        this.setState({focusedLayoutItem:test})
    },
    handleLogout: function (event) {
        SceneActions.logout();
    },
    componentWillMount:function(){
        GridStore.addChangeListener(this._onChange)
    },
    componentWillUnmount:function(){
        GridStore.removeChangeListener(this._onChange)
    },
    getNavComponent: function () {
        switch (this.state.focusedLayoutItem) {
            case "scene":
                return <li><span  className="navbar-text">Scene</span></li>;
                break;
            case "sceneGraph":
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
                            <li>

                                <p className="navbar-text">{connectionCache.getGroupID()}
                                    - {connectionCache.getShortGroupName(connectionCache.getGroupID())}</p>

                            </li>
                            <li>
                                <button type="button" className='btn btn-dark navbar-btn' onClick={this.handleLogout}>Log out
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
