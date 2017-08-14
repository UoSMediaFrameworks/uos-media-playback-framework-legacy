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
    componentWillMount: function () {
        GridStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function () {

        GridStore.removeChangeListener(this._onChange);
    },
    componentDidMount: function () {
        var dom = ReactDOM.findDOMNode(this);
        this.setState({parentHeight: dom.parentElement.clientHeight});
    },
    onLayoutChange: function (layout) {

        var self=this;
        // APEP TODO should we not be updating the store in this case?
        // APEP I guess each item keeps the values updated, but it does seem odd that we would not update store
        // AngelP : This function can be used to keep component layout changes in the store, but the use case for it, to record changes
        // for local storage.

            var mergedList = _.map(self.state.data.layout, function(item){
                return _.extend(item, _.findWhere(layout, { i: item.i }));
            });

            SceneActions.layoutChange(mergedList);

    },
    getComponent: function (item) {
        var self = this;
        switch (item.type) {
            case "Scene":
                return <Scene isLayout={true} _id={self.state.data.scene._id}/>;
                break;
            case "Scene-Graph":
                return <SceneGraph isLayout={true} _id={self.state.data.sceneGraph._id}/>;
                break;
            case "Scene-List":
                return <SceneChooser isLayout={true} sceneFocusHandler={GridStore.focusScene}/>;
                break;
            case "Scene-Graph-List":
                return <SceneGraphChooser isLayout={true} sceneGraphFocusHandler={GridStore.focusSceneGraph}/>;
                break;
            case "Graph-Viewer":
                return <GraphViewer isLayout={true} roomId={self.state.data.roomId}></GraphViewer>;
                break;
            case "Scene-Viewer":
                return <SceneListener isLayout={true} sceneId={self.state.data.scene._id}/>;
                break;
            case "Graph":
                return <GraphTest isLayout={true} _id={self.state.data.sceneGraph._id}/>;
                break;
            default:
                return null;
                break
        }
    },
    onDragStopHandler: function (e, u) {
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
    removeComponent:function(item){
        SceneActions.removeLayoutComponent(item.i);

    },
    render: function () {
        var self = this;

        var components = this.state.data.layout.map(function (item, index) {
                var comp = self.getComponent(item);
            var shouldHide = (item.state === "default") ? true : false;
                if (comp && item.visible) {
                    return (
                        <div key={item.i} className="widget-container">
                            <section className="widget">
                                <header className="react-drag-handle">
                                     <span className="widget-title">
                                        <span>{item.type}</span>
                                    </span>
                                    <div className="grid-layout-controls">
                                        <i className={shouldHide?"fa fa-times mf-times":"hidden"}
                                           onClick={self.removeComponent.bind(this, item) }>
                                        </i>
                                        <i className={ shouldHide?"hidden":"fa fa-window-restore mf-restore"}
                                           onClick={self.restore.bind(this, index, item)}>
                                        </i>
                                        <i
                                            onClick={self.max.bind(this, index, item)}
                                            className={ shouldHide ? "fa fa-window-maximize mf-maximize":"hidden "}>
                                        </i>
                                    </div>
                                </header>
                                <div className="grid-layout-body">
                                    {comp}
                                </div>
                            </section>
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

        return (
            <ReactGridLayout onDragStart={this.onDragStopHandler} className="layout" autoSize={true} draggableHandle=".react-drag-handle"
                             onLayoutChange={this.onLayoutChange}
                             layout={this.state.data.layout}
                             verticalCompact={true}
                             cols={6}
                             rowHeight={(this.state.parentHeight != null) ? this.state.parentHeight / 30 : 30}>
                {components}

            </ReactGridLayout>
        )
    }

});

module.exports = RespGrid;
