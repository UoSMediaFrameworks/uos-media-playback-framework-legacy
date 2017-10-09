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
var LayoutMonacoTextEditor = require("./layout-text-editor.jsx");
var _ = require("lodash");
var SceneActions = require("../../actions/scene-actions");
var HubClient = require('../../utils/HubClient');
var HubSendActions =require('../../actions/hub-send-actions');

var PopOutComp = React.createClass({
    getInitialState: function () {
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

        GridStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {

        GridStore.removeChangeListener(this._onChange);
    },
    getComponent: function (item) {
        var self = this;
        switch (item) {
            case "Scene-Graph":
                return <SceneGraph  _id={self.state.data.sceneGraphId}/>;
                break;
            case "Graph-Viewer":
                HubClient.registerToGraphPlayerRoom(self.state.data.roomId);
                return <GraphViewer ></GraphViewer>;
                break;
            case "Scene-Viewer":
                return <SceneListener sceneViewer={true} sceneId={self.state.data.sceneId}/>;
                break;
            case "Graph":
                return <GraphTest isLayout={true}  _id={self.state.data.sceneGraphId}/>;
                break;
            case "Scene-Media-Browser":
                          HubSendActions.loadScene(self.state.data.sceneId)
                return <SceneMediaBrowser saveStatus={self.state.saveStatus}  focusedMediaObject={self.state.gridData.focusedMediaObject}
                                           _id={self.state.data.sceneId}></SceneMediaBrowser>;
                break;
            case "Scene-Editor":
                HubSendActions.loadScene(self.state.data.sceneId)
                return <LayoutMonacoTextEditor focusedMediaObject={self.state.gridData.focusedMediaObject} sceneSavingHandler={self.sceneSavingHandler}
                                               _id={self.state.data.sceneId}  focusHandler={SceneActions.changeMediaObjectFocus}
                ></LayoutMonacoTextEditor>;
                break;
            default:
                return <div>
                    This Component does not work by itself.
                </div>;
                break
        }

    },
    render: function () {
        var self = this;
        try{
            var component = self.getComponent(self.state.data.type);
        }catch(e)
        {
            console.log(e)
        }
        return (
            <div className="mf-pop-out-component">
            {component}
            </div>
        );
    }
});

module.exports = PopOutComp;
