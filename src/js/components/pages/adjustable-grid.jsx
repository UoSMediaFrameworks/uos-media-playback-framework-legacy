var React = require('react');
var ReactDOM = require('react-dom');
var ReactGridLayout = require('react-grid-layout');
var WidthProvider = require('react-grid-layout').WidthProvider;
var Scene = require('./scene.jsx');
var SceneMediaBrowser = require('./scene-media-browser.jsx');
var SceneEditorGUI = require('./scene-editor-gui.jsx');
var TagEditor = require('./tag-editor.jsx');
var SceneGraph = require('./scenegraph.jsx');
var GraphTest = require('../graphs/index.jsx');
var SceneGraphChooser = require('./scene-graph-choose-or-create.jsx');
var SceneListener = require('../../pages/scene-listener.jsx');
var GraphViewer = require("../../pages/viewer/graph-viewer.jsx");
var GridStore = require("../../stores/grid-store.js");
var SceneStore = require("../../stores/scene-store");
var LayoutMonacoTextEditor = require("./layout-text-editor.jsx");
var _ = require("lodash");
var SceneActions = require("../../actions/scene-actions");
var LayoutConstants = require("../../constants/layout-constants"),
    LayoutComponentTypes = LayoutConstants.ComponentTypes,
    LayoutComponentTitles = LayoutConstants.ComponentTitles,
    LayoutComponentTypesForPopout = LayoutConstants.ComponentTypesForPopout,
    LayoutComponentTypesForPresentation = LayoutConstants.ComponentTypesForPresentation;
var GraphTitles = require("../../constants/graph-constants").GraphTitles;

ReactGridLayout = WidthProvider(ReactGridLayout);
var RespGrid = React.createClass({
    getInitialState: function () {
        return {
            data: GridStore.getGridState(),
            cols: 30,
            rows: 30
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
    },
    onLayoutChange: function (layout) {
        var self = this;

        // TODO APEP Not sure if we need to do this remapping, I think we can just send layout param straight through actions
        var mergedList = _.map(self.state.data.layout, function (item) {
            return _.extend(item, _.findWhere(layout, {i: item.i}));
        });

        SceneActions.layoutChange(mergedList);
    },
    getComponent: function (item) {
        var self = this;
        switch (item.type) {
            case LayoutComponentTypes.SceneGraph:
                return <SceneGraph isLayout={true} _id={self.state.data.sceneGraph._id}/>;
                break;
            case LayoutComponentTypes.SceneGraphList:
                return <SceneGraphChooser isLayout={true} sceneGraphFocusHandler={GridStore.focusSceneGraph}/>;
                break;
            case LayoutComponentTypes.GraphViewer:
                return <GraphViewer isLayout={true} roomId={self.state.data.roomId}/>;
                break;
            case LayoutComponentTypes.SceneViewer:
                return <SceneListener isLayout={true} sceneViewer={true} sceneId={self.state.data.scene._id}/>;
                break;
            case LayoutComponentTypes.Graph:
                return <GraphTest isLayout={true} _id={self.state.data.sceneGraph._id}/>;
                break;
            case LayoutComponentTypes.SceneMediaBrowser:
                return ( <SceneMediaBrowser isLayout={true} scene={SceneStore.getScene(this.state.data.scene._id) || {}}
                                            focusedMediaObject={this.state.data.focusedMediaObject}
                                            _id={self.state.data.scene._id}>
                    </SceneMediaBrowser>
                );
                break;
            case LayoutComponentTypes.SceneEditorGUI:
                return (
                    <SceneEditorGUI isLayout={true}
                                    scene={SceneStore.getScene(this.state.data.scene._id) || {}}
                                    focusedMediaObject={this.state.data.focusedMediaObject}
                                    _id={self.state.data.scene._id}>
                    </SceneEditorGUI>
                );
                break;
            case LayoutComponentTypes.TagEditor:
                return (
                    <TagEditor
                        isLayout={true}
                        scene={SceneStore.getScene(this.state.data.scene._id) || {}}
                        focusedMediaObject={this.state.data.focusedMediaObject}
                        _id={self.state.data.scene._id}
                    />
                );
                break;
            case LayoutComponentTypes.SceneEditor:
                return ( <LayoutMonacoTextEditor isLayout={true}
                                                 focusedMediaObject={this.state.data.focusedMediaObject}
                                                 focusFromMonacoEditor={this.state.data.fromMonacoEditor}
                                                 _id={this.state.data.scene._id}
                                                 focusHandler={SceneActions.changeMediaObjectFocus}>
                    </LayoutMonacoTextEditor>
                );
                break;
            default:
                return null;
                break
        }
    },

    getComponentTitle: function (item) {
        var self = this;
        switch (item.type) {
            case LayoutComponentTypes.SceneViewer:
                if (self.state.data.scene._id) {
                    return LayoutComponentTitles[item.type] + " - " + self.state.data.scene.name;
                } else {
                    return LayoutComponentTitles[item.type];
                }
                break;
            case LayoutComponentTypes.Graph:
                if (self.state.data.sceneGraph.name) {
                    return GraphTitles[self.state.data.sceneGraph.type] + " " + LayoutComponentTitles[item.type] + " - " + self.state.data.sceneGraph.name;
                } else {
                    return LayoutComponentTitles[item.type];
                }
                break;
            case LayoutComponentTypes.GraphViewer:
                if (self.state.data.sceneGraph.name) {
                    return LayoutComponentTitles[item.type] + " - " + self.state.data.sceneGraph.name;
                } else {
                    return LayoutComponentTitles[item.type];
                }
                break;
            default:
                return LayoutComponentTitles[item.type];
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

    // APEP Calculate the height each time this is called
    max: function (index, item) {
        // APEP calculate the height of the screen using the parent component.  This is fixed to the max size of screen
        // Library uses this maths for calculating height of a component heightPx * h + (marginH * (h - 1))
        var margin = 10;
        var dom = ReactDOM.findDOMNode(this);
        var rowHeight = dom.parentElement.clientHeight / this.state.rows;
        var elementHeightPlusMargin = dom.parentElement.clientHeight + margin;
        var rowHeightPlusMargin = rowHeight + margin;

        // Rearranged h = (elementHeight + marginH) / (heightPx + marginH)
        var maxHeightValue = Math.floor(elementHeightPlusMargin / rowHeightPlusMargin);

        SceneActions.maxComp(index, item, maxHeightValue);
    },
    popout: function (index, item, isForPresentation) {
        var popoutElementDom = this.refs[item.i];
        SceneActions.popoutComp(index, item, popoutElementDom.offsetWidth, popoutElementDom.offsetHeight, isForPresentation)
    },
    getLeftSideComponent: function (item) {
        if (item.state == "default") {
            if (item.x == 0) {
                return (
                    <i className="fa fa-angle-left " onClick={this.collapseComponent.bind(null, item, "left")}></i>
                )
            } else {
                return null
            }
        } else if (item.state == "collapsed-left") {
            return (
                <i className="fa fa-angle-right " onClick={this.expandComponent.bind(null, item, "left")}></i>
            )
        }
    },
    getRightSideComponent: function (item) {
        if (item.state == "default") {
            if (item.x == this.state.cols - item.w) {
                return (
                    <i className="fa fa-angle-right " onClick={this.collapseComponent.bind(null, item, "right")}> </i>
                )
            } else {
                return null
            }
        } else if (item.state == "collapsed-right") {
            return (
                <i className="fa fa-angle-left" onClick={this.expandComponent.bind(null, item, "right")}></i>
            )
        }
    },
    collapseComponent: function (item, type) {

        switch (type) {
            case "left":
                SceneActions.collapseLeft(item);
                break;
            case "right":
                SceneActions.collapseRight(item);
                break;
        }
    },
    expandComponent: function (item, type) {
        switch (type) {
            case "left":
                SceneActions.expandLeft(item);
                break;
            case "right":
                SceneActions.expandRight(item);
                break;
        }
    },
    removeComponent: function (item) {
        SceneActions.removeLayoutComponent(item.i);
    },
    render: function () {
        var self = this;

        var rowHeight = this.state.rows;
        var dom = ReactDOM.findDOMNode(this);
        if (dom && dom.parentElement) {
            rowHeight = dom.parentElement.clientHeight / this.state.rows;
        }

        var components = this.state.data.layout.map(function (item, index) {
            var leftComp = self.getLeftSideComponent(item);
            var rightComp = self.getRightSideComponent(item);

            var shouldHide = item.state === "default" || item.state === "max";
            var comp = shouldHide ? self.getComponent(item) : <a></a>;

            // APEP if the component is on both the left and right hand side, we declare it is neither.
            if (leftComp && rightComp) {
                leftComp = rightComp = null;
            }

            var componentPopoutButton = LayoutComponentTypesForPopout.hasOwnProperty(item.type)? < i
                className={item.state === "default" ? "fa fa-share-alt-square  mf-maximize" : "hidden "}
                onClick={self.popout.bind(self, index, item, false)
                }>
            </i> : <span></span>;

            var componentPresentation = LayoutComponentTypesForPresentation.hasOwnProperty(item.type)? <i
                className={item.state === "default" ? "fa fa-television  mf-maximize" : "hidden "}
                onClick={self.popout.bind(self, index, item, true)}>
            </i> : <span></span>;

            if (comp && item.visible) {
                var compTitle = self.getComponentTitle(item);
                return (
                    <div key={item.i} ref={item.i} className="widget-container">
                        <section className="widget">
                            <header className="react-drag-handle">
                                <span className="widget-title">
                                    {compTitle}
                                </span>
                                <div className="grid-layout-controls">
                                    {leftComp}
                                    {rightComp}
                                    {componentPresentation}
                                    {componentPopoutButton}
                                    <i className={item.state !== "max" ? "hidden" : "fa fa-window-restore mf-restore"}
                                       onClick={self.restore.bind(self, index, item)}>
                                    </i>
                                    <i className={item.state === "default" ? "fa fa-window-maximize mf-maximize" : "hidden "}
                                       onClick={self.max.bind(self, index, item)}>
                                    </i>
                                    <i className={"fa fa-times mf-times"}
                                       onClick={self.removeComponent.bind(self, item)}>
                                    </i>
                                </div>
                            </header>
                            <div className={"grid-layout-body"}>
                                {comp}
                            </div>
                        </section>
                    </div>
                )
            } else {
                return null;
            }
        });

        components = _.filter(components, function (c) {
            return c !== null;
        });

        return (
            <ReactGridLayout onDragStart={this.onDragStopHandler}
                             className="layout"
                             autoSize={true}
                             draggableHandle=".react-drag-handle"
                             onLayoutChange={this.onLayoutChange}
                             layout={this.state.data.layout}
                             verticalCompact={true}
                             cols={this.state.cols}
                             rowHeight={rowHeight}>
                {components}
            </ReactGridLayout>
        )
    }
});

module.exports = RespGrid;
