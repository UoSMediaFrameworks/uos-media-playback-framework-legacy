var React = require('react');
var ReactDOM = require('react-dom');
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
var NavBar = require('../navigation-bar.jsx');
var _ = require("lodash");
var hat = require("hat");
var SceneActions = require("../../actions/scene-actions");

ReactGridLayout = WidthProvider(ReactGridLayout);
var RespGrid = React.createClass({
    getInitialState: function () {
        return {
            data: GridStore.getGridState(),
            parentHeight: null

        }
    },

    _onChange: function () {
        this.setState({data: GridStore.getGridState()})
    },
    modeChangeHandler: function (e) {
        if (e.altKey && e.keyCode == 77) {
            SceneActions.switchCompMode();
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
    componentDidMount: function () {
        var dom = ReactDOM.findDOMNode(this);
        console.log("did Mount", dom.parentElement.clientHeight);
        this.setState({parentHeight: dom.parentElement.clientHeight});
    },
    onLayoutChange: function (layout) {
        // APEP TODO should we not be updating the store in this case?
        // APEP I guess each item keeps the values updated, but it does seem odd that we would not update store
        // AngelP : This function can be used to keep component layout changes in the store, but the use case for it, to record changes
        // for local storage.
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
            case "nav":
                return <NavBar></NavBar>;
                break;
            default:
                return null;
                break
        }
    },
    onDragStopHandler: function (e, u,a,b,c,d,e) {
        var item = _.find(this.state.data.layout, function (layoutItem) {
            return layoutItem.i === u.i;
        });
        SceneActions.changeFocus(item.type);

    },
    // APEP this could be refactored, no real easy why i've written these to proxy the SceneAction methods.
    min: function (index, item) {
        SceneActions.minComp(index, item);
    },
    restore: function (index, item) {
        SceneActions.restoreComp(index, item);
    },
    max: function (index, item) {
        var maxHeightValue = this.state.parentHeight ? this.state.parentHeight / 30 : 30;
        SceneActions.maxComp(index, item, maxHeightValue);
    },
    render: function () {
        var self = this;

        var components = this.state.data.layout.map(function (item, index) {
                var comp = self.getComponent(item);

                var shouldHide = (item.state === "default") ? true : false;
                console.log(item,comp)
                var isDraggable = !item.isDraggable;
                if (comp && item.visible) {
                    return (
                        <div key={item.i}
                             className="layout-border">
                            <div className="test-buttons" hidden={isDraggable}>
                                {/*TODO keep commented out for now / or add a conditional statement for usability testing*/}
                                {/*    <button className="btn-dark"><i onClick={self.min.bind(this, index, item)}
                                 className="fa fa-window-minimize">

                                 </i></button>*/}
                                <button className="btn-dark" hidden={!shouldHide}><i
                                    onClick={self.max.bind(this, index, item)}
                                    className="fa fa-window-maximize">

                                </i></button>
                                <button className={"btn-dark"} hidden={shouldHide}><i
                                    onClick={self.restore.bind(this, index, item)}
                                    className="fa fa-window-restore">
                                </i></button>
                                {/* <h2>{item.type}</h2>*/}
                            </div>
                            {comp}

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
        console.log(components);
        var test = (this.state.parentHeight != null) ? this.state.parentHeight / 30 : 30;
        return (
              <ReactGridLayout onDragStart={this.onDragStopHandler } className="layout" autoSize={true}
             onLayoutChange={this.onLayoutChange}
                               layout={this.state.data.layout}
                               verticalCompact={true}
             cols={12}
             rowHeight={(this.state.parentHeight != null) ? this.state.parentHeight / 30 : 30 }>
                  {components}

             </ReactGridLayout>
        )
    }

});

module.exports = RespGrid;
