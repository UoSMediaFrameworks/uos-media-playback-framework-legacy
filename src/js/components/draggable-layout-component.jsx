var Scene = require('./pages/scene.jsx');
var SceneGraph = require('./pages/scenegraph.jsx');
var GraphTest = require('./graphs/index.jsx');
var SceneGraphChooser = require('./pages/scene-graph-choose-or-create.jsx');
var SceneListener = require('../pages/scene-listener.jsx');
var GridStore = require("../stores/grid-store.js");
var React = require('react');

/*ToDo investigate why this component did not work with react grid layout*/
var DraggableLayoutComponent = React.createClass({


    getInitialState: function () {
        return {
            data:GridStore.getGridState(),
            minimzed:false
        }
    },

    _onChange:function(){
        this.setState({data:GridStore.getGridState()})
    },
    componentWillMount: function () {
        GridStore.addChangeListener(this._onChange());
    },
    componentWillUnmount: function () {
        GridStore.removeChangeListener(this._onChange());
    },
    getComponent: function () {
        switch (this.props.data.type) {
            case "scene":
                return <Scene _id={this.state.data.scene._id}/>;
                break;
            case "sceneGraph":
                return  <SceneGraph _id={this.state.data.sceneGraph._id}/>;
                break;
            case "sceneGraphList":
                return <SceneGraphChooser sceneGraphFocusHandler={GridStore.focusSceneGraph}/>;
                break;
            case "graphViewer":
                return null;
                break;
            case "sceneViewer":
                return <SceneListener sceneId={this.state.scene._id}/>;
                break;
            case "graph":
                return <GraphTest />;
                break;
            case "":
                return null;
                break;
            default:
                return <div>Hey</div>;
                break
        }
    },
    render: function () {
        var component = this.getComponent();
        return (
            <div key={this.props.data.i} data-grid={this.props.data}>
                <div  className="layout-border">
                    <div className="button-controls">
                        <button className={"btn-dark " + this.state.minimized ? "visible":"" }><i className="fa fa-window-restore">
                        </i></button>
                        <button className={"btn-dark " + !this.state.minimized ? "visible":"" }><i className="fa fa-window-minimize">
                        </i></button>
                        {component}
                        {this.props.children}
                    </div>
                </div>

            </div>
        )
    }


});

module.exports = DraggableLayoutComponent;
