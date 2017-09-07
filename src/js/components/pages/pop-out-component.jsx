var React = require('react');
var ReactDOM = require('react-dom');
var SceneMediaBrowser = require('./scene-media-browser.jsx');
var SceneGraph = require('./scenegraph.jsx');
var GraphTest = require('../graphs/index.jsx');
var SceneChooser = require('./scene-choose-or-create.jsx');
var SceneGraphChooser = require('./scene-graph-choose-or-create.jsx');
var SceneListener = require('../../pages/scene-listener.jsx');
var GraphViewer = require("../../pages/viewer/graph-viewer.jsx");
var GridStore = require("../../stores/grid-store.js");
var SceneStore = require("../../stores/scene-store");
var LayoutMonacoTextEditor = require("./layout-text-editor.jsx");
var _ = require("lodash");
var SceneActions = require("../../actions/scene-actions");
var HubSendActions = require("../../actions/hub-send-actions");
var PopOutComp = React.createClass({
    getInitialState: function () {
        console.log("initiing",this)
        return {
            data: this.props.location.query,
                gridData:GridStore.getGridState(),
            saveStatus: true};
    },
    _onChange: function () {
        this.setState({gridData: GridStore.getGridState()})
    },
    sceneSavingHandler: function(saveStatus) {
        this.setState({saveStatus: saveStatus});
    },
    componentWillMount: function () {
        try{
            console.log("pop",this);
            HubSendActions.loadScene(this.state.data.sceneId) ;
        }catch(e)
        {
            console.log(e)
        }
        GridStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {

        GridStore.removeChangeListener(this._onChange);
    },
    getComponent: function (item) {
        var self = this;
        console.log(item);
        switch (item) {
            case "Scene-Graph":
                return <SceneGraph  _id={self.state.data.sceneGraphId}/>;
                break;
            case "Scene-List":
                return <SceneChooser  sceneFocusHandler={GridStore.focusScene}/>;
                break;
            case "Scene-Graph-List":
                return <SceneGraphChooser sceneGraphFocusHandler={GridStore.focusSceneGraph}/>;
                break;
            case "Graph-Viewer":
                return <GraphViewer roomId={self.state.gridData.roomId}></GraphViewer>;
                break;
            case "Scene-Viewer":
                return <SceneListener sceneViewer={true} sceneId={self.state.data.sceneId}/>;
                break;
            case "Graph":
                return <GraphTest  _id={self.state.data.sceneGraphId}/>;
                break;
            case "Scene-Media-Browser":
                return <SceneMediaBrowser saveStatus={this.state.saveStatus}  focusedMediaObject={this.state.gridData.focusedMediaObject}
                                           _id={self.state.data.sceneId}></SceneMediaBrowser>;
                break;
            case "Scene-Editor":
                return <LayoutMonacoTextEditor focusedMediaObject={this.state.gridData.focusedMediaObject} sceneSavingHandler={this.sceneSavingHandler}
                                               _id={this.state.data.sceneId}  focusHandler={SceneActions.changeMediaObjectFocus}
                ></LayoutMonacoTextEditor>;
                break;
            default:
                return null;
                break
        }

    },
    render: function () {
        var self = this;
        try{
            var component = self.getComponent(self.state.data.type);
            console.log("single",self);
        }catch(e)
        {
            console.log(e)
        }
        return (
            <div>
            {component}
            </div>
        );
    }
});

module.exports = PopOutComp;
