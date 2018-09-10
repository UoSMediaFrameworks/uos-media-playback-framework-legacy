var React = require('react');
var ReactDOM = require('react-dom');
var SceneMediaBrowser = require('../components/scene-media-browser.jsx');
var SceneGraph = require('../components/scenegraph.jsx');
var GraphTest = require('../components/graphs/index.jsx');
var SceneGraphChooser = require('../components/scene-graph-choose-or-create.jsx');
var SceneListener = require('../components/viewer/scene-listener.jsx');
var GraphViewer = require("../components/viewer/graph-viewer.jsx");
var GridStore = require("../stores/grid-store.js");
var LayoutMonacoTextEditor = require("../components/scene-editor/layout-text-editor.jsx");
var _ = require("lodash");
var SceneActions = require("../actions/scene-actions");
var HubClient = require('../utils/HubClient');
var LayoutComponentConstants = require('../constants/layout-constants').ComponentTypes;
var HubSendActions =require('../actions/hub-send-actions');

var PopOutComp = React.createClass({
    getInitialState: function () {
        return {
            data: this.props.location.query,
            gridData: GridStore.getGridState(),
            saveStatus: true
        };
    },
    _onChange: function () {
        this.setState({gridData: GridStore.getGridState()})
    },
    sceneSavingHandler: function (saveStatus) {
        this.setState({saveStatus: saveStatus});
    },
    componentWillMount: function () {

        GridStore.addChangeListener(this._onChange);
    },
    componentDidMount:function(){
        SceneActions.changeFocus(this.state.data.type);
    },
    componentWillUnmount: function () {

        GridStore.removeChangeListener(this._onChange);
    },
    getComponent: function (item) {
        var self = this;

        switch (item) {
            case LayoutComponentConstants.SceneGraph:
                return <SceneGraph _id={self.state.data.sceneGraphId}/>;
                break;
            case LayoutComponentConstants.SceneGraphList:
                return <SceneGraphChooser sceneGraphFocusHandler={GridStore.focusSceneGraph}/>;
                break;
            case LayoutComponentConstants.GraphViewer:
                if(self.state.data.roomId) {
                    HubClient.registerToGraphPlayerRoom(self.state.data.roomId);
                }
                return <GraphViewer></GraphViewer>;
                break;
            case LayoutComponentConstants.SceneViewer:
                return <SceneListener sceneViewer={true} sceneId={self.state.data.sceneId}/>;
                break;
            case LayoutComponentConstants.Graph:
                if(self.state.data.roomId){
                    HubClient.registerToGraphPlayerRoom(self.state.data.roomId)
                }
                return <GraphTest isLayout={true} _id={self.state.data.sceneGraphId}/>;
                break;
            case LayoutComponentConstants.SceneMediaBrowser:
                HubSendActions.loadScene(self.state.data.sceneId)
                return <SceneMediaBrowser saveStatus={self.state.saveStatus}
                                          focusedMediaObject={self.state.gridData.focusedMediaObject}
                                          _id={self.state.data.sceneId}></SceneMediaBrowser>;
                break;
            case LayoutComponentConstants.SceneEditor:
                HubSendActions.loadScene(self.state.data.sceneId)
                return <LayoutMonacoTextEditor focusedMediaObject={self.state.gridData.focusedMediaObject}
                                               sceneSavingHandler={self.sceneSavingHandler}
                                               _id={self.state.data.sceneId}
                                               focusHandler={SceneActions.changeMediaObjectFocus}
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
        try {
            var component = self.getComponent(self.state.data.type);
        } catch (e) {
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
