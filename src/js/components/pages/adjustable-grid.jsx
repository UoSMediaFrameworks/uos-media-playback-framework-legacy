var React = require('react');
var ReactGridLayout = require('react-grid-layout');
var ResponsiveGridLayout = require('react-grid-layout').Responsive;
var WidthProvider = require('react-grid-layout').WidthProvider;
var Scene = require('./scene.jsx');
var SceneGraph = require('./scenegraph.jsx');
var GraphTest = require('../graphs/index.jsx');
var SceneChooser = require('./scene-choose-or-create.jsx');
var SceneGraphChooser = require('./scene-graph-choose-or-create.jsx');
var SceneListener = require('../../pages/scene-listener.jsx');
var GraphViewer = require("../../pages/viewer/graph-viewer.jsx");
var GridStore = require("../../stores/grid-store.js");
var _ = require("lodash");
var hat = require("hat");

ReactGridLayout = WidthProvider(ReactGridLayout);
var RespGrid = React.createClass({
    getInitialState: function () {
        return {
            data: GridStore.getGridState(),
            min1: false,

        }
    },

    _onChange: function () {


        this.setState({data: GridStore.getGridState()})
    },
    modeChangeHandler: function (e) {
        if (e.altKey && e.keyCode == 77) {
            GridStore.changeMode();
        }
    },
    componentWillMount: function () {
        document.addEventListener('keyup', this.modeChangeHandler, false);
        GridStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function () {
        document.removeEventListener('keyup', this.modeChangeHandler, false);
        GridStore.removeChangeListener(this._onChange);
    },
    onLayoutChange: function (layout) {
        console.log("onLayoutChange", layout, this);
    },
    getComponent: function (item) {
        var self = this;
        switch (item.type) {
            case "scene":
                return <Scene isLayout={true} _id={self.state.data.scene._id}/>;
                break;
            case "sceneGraph":
                return <SceneGraph isLayout={true} _id={self.state.data.sceneGraph._id}/>;
                break;
            case "sceneList":
                return <SceneChooser isLayout={true} sceneFocusHandler={GridStore.focusScene}/>;
                break;
            case "sceneGraphList":
                return <SceneGraphChooser isLayout={true} sceneGraphFocusHandler={GridStore.focusSceneGraph}/>;
                break;
            case "graphViewer":
                return <GraphViewer isLayout={true} roomId={self.state.data.roomId}></GraphViewer>;
                break;
            case "sceneViewer":
                return <SceneListener isLayout={true} sceneId={self.state.data.scene._id}/>;
                break;
            case "graph":
                return <GraphTest isLayout={true} _id={self.state.data.sceneGraph._id}/>;
                break;
            case "":
                return null;
                break;
            default:
                return <div>None of the component types have been provided</div>;
                break
        }
    },
    render: function () {
        var self = this;
        var components = this.state.data.layout.map(function (item, index) {
                var comp = self.getComponent(item);
                if (comp) {
                    return (
                        <div key={item.i}
                             className="layout-border">
                            <div className="test-buttons">
                                <button className="btn-dark"><i onClick={GridStore.minimize.bind(this, index, item)}
                                                                className="fa fa-window-minimize">

                                </i></button>
                                <button className="btn-dark"><i onClick={GridStore.maximize.bind(this, index, item)}
                                                                className="fa fa-window-maximize">

                                </i></button>
                                <button className="btn-dark"><i onClick={GridStore.restore.bind(this, index, item)}
                                                                className="fa fa-window-restore">
                                </i></button>
                            </div>
                            {item.visible ? comp : null}
                        </div>
                    )

                } else {
                    return null;
                }

            }
        );

        components = _.filter(components, function (c) {
            return c != null;
        });


        return (<ReactGridLayout className="layout" autoSize={true} onLayoutChange={this.onLayoutChange}
                                 layout={this.state.data.layout} verticalCompact={false}
                                 cols={12} rowHeight={30}
            >
                {components}

            </ReactGridLayout>
        )
    }

});

module.exports = RespGrid;
