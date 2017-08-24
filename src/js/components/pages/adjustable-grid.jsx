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
            parentHeight: null,
            cols:30
        }
    },

    _onChange: function () {
        this.setState({data: GridStore.getGridState()})
    },
    componentWillMount: function () {
        console.log("grid will mount")
        GridStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function () {

        GridStore.removeChangeListener(this._onChange);
    },
    componentDidMount: function () {
        var dom = ReactDOM.findDOMNode(this);
        console.log("it did mount")
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
    getLeftSideComponent:function(item){
        if(item.state == "default"){
            if(item.x == 0){
                return (
                    <button className="mf-vertical-collapse-btn btn-dark left" onClick={this.collapseComponent.bind(this,item,"left")}>
                        <span className="glyphicon glyphicon-chevron-left"></span>
                    </button>
                )
            }else{
                return null
            }
        }else if(item.state == "collapsed-left"){
            return (
                <button className="mf-vertical-expand-btn btn-dark left" onClick={this.expandComponent.bind(this,item,"left")}>
                     <span className="glyphicon glyphicon-chevron-right"></span>
                </button>
            )
        }
    },
    getRightSideComponent:function(item){
        if(item.state == "default"){
            if(item.x == this.state.cols - item.w){
                return (
                    <button className="mf-vertical-collapse-btn btn-dark right" onClick={this.collapseComponent.bind(this,item,"right")}>
                        <span className="glyphicon glyphicon-chevron-right"> </span>
                    </button>
                )
            }else{
                return null
            }
        }else if(item.state == "collapsed-right"){
            return (
                <button className="mf-vertical-expand-btn btn-dark right" onClick={this.expandComponent.bind(this,item,"right")}>
                    <span className="glyphicon glyphicon-chevron-left"></span>
                </button>
            )
        }
    },
    collapseComponent:function(item,type){
        console.log("collapse",type,item)
     switch(type){
         case "left":
             SceneActions.collapseLeft(item);
             break;
         case "right":
             SceneActions.collapseRight(item);
                 break;
     }
    },
    expandComponent:function(item,type){
        switch(type){
            case "left":
                SceneActions.expandLeft(item);
                break;
            case "right":
                SceneActions.expandRight(item);
                break;
        }
    },
    removeComponent:function(item){
        SceneActions.removeLayoutComponent(item.i);
    },
    render: function () {
        console.log("we got to the render start",this)
        var self = this;
        try{
            var components = this.state.data.layout.map(function (item, index) {
                    var comp = self.getComponent(item);
                    var leftComp = self.getLeftSideComponent(item);
                    var rightComp = self.getRightSideComponent(item);
                    var shouldHide = (item.state === "default") ? true : false;
                    var test = null;
                    if (shouldHide) {
                        test = (
                            <div className="grid-layout-body">
                                {leftComp}
                                {comp}
                                {rightComp}
                            </div>

                        )
                    }else{
                        test = (
                            <div className="grid-layout-body">
                                {leftComp}
                                {rightComp}
                            </div>
                        )
                    }

                    if (comp && item.visible) {
                        return (
                            <div key={item.i} className="widget-container">
                                <section className="widget">
                                    <header className="react-drag-handle">
                                     <span className="widget-title">
                                        <span>{item.type.replace(/-/g, ' ')}</span>
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
                                    {test}
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
                                 cols={this.state.cols}
                                 rowHeight={(this.state.parentHeight != null) ? this.state.parentHeight / 30 : 30}>
                    {components}

                </ReactGridLayout>
            )
        }catch(e){
            console.log("exception",e)
        }

    }

});

module.exports = RespGrid;
