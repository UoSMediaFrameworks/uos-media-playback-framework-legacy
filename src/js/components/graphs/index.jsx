var React = require("react");
var ReactDom = require("react-dom");

var SceneGraphListStore = require('../../stores/scene-graph-list-store.jsx');
var SceneGraphStore = require('../../stores/scene-graph-store.jsx');
var HubSendActions = require('../../actions/hub-send-actions');
var connectionCache = require("../../utils/connection-cache");
var NarmGraph = require('./narm-graph.jsx');
var MemoirGraph = require('./memoir-graph.jsx');
var GDCGraph = require('./gdc-graph.jsx');
var ThumbGraph = require('./thumbnail-graph.jsx');
var CeramicGraph = require('./ceramic-graph.jsx');
var BreadcrumbsStore = require('../../stores/breadcrumbs-store');
var QRCODE = require('qrcode.react');
var OptionsMenu = require('./options-menu.jsx');
var BreadcrumbsMenu = require('./breadcrumbs-menu.jsx');
var AutowalkMenu = require('./autowalk-menu.jsx');
var classes = require('classnames');
var _ = require("lodash");
var hat = require("hat");
var GridStore = require("../../stores/grid-store");
var GraphTypes = require("../../constants/graph-constants").GraphTypes;
var SoundGui = require('./sound-graph.jsx');

var GraphContainer = React.createClass({
    getInitialState: function () {
        return {
            graphId: null,
            sceneList: null,
            root: {
                nodes: [],
                links: []
            },
            breadcrumbsList: [],
            viewerURL: window.location.hostname + '/graph-viewer.html#/?room=' + connectionCache.getSocketID(),
            QRToggle: false,
            width: 0,
            height: 0,
            autocompleteToggle: false,
            breadcrumbsToggle: false,
            autoWalkToggle: false,
            optionsMenuToggle: false,
            guid: null,
            graphType: "",
            title: "",
            previousGraphId: null
        }
    },
    _onChange: function () {
        var sceneGraph = SceneGraphListStore.getSceneGraphByID(this.state.graphId);
        this._initialize(sceneGraph);
    },
    _onSceneChange: function () {
        var sceneGraph = SceneGraphStore.getSceneGraph(this.state.graphId);
        this._initialize(sceneGraph);
    },
    _onCrumbsChange: function () {
        this.setState({breadcrumbsList: BreadcrumbsStore.getBreadcrumbs()});
    },
    titleHandler: function (title) {
        this.setState({title: title})
    },
    _initialize(sceneList) {

        var self = this;

        var localRoot = {
            nodes: [],
            links: []
        };
        var circularRef = [];

        function processNodes(data) {

            data.forEach(function (obj) {
                obj.x = obj.y = 0;
                obj.cx = self.state.width / 2 - self.state.width * 0.1;
                obj.cy = self.state.height / 2 - self.state.height * 0.2;
                obj.width = 120;
                obj.height = 90;
                obj.r = 2;
                obj.children = [];
                obj.parents = [];
                obj.related = [];
                obj.color = 'white';
                obj.visible = true;
                obj.highlighted = false;
                localRoot.nodes.push(obj)
            })
        }

        function processsEdges() {
            //This function creates the relationships between the different nodes based on the data received.
            //For each node's parent relationship id's find th e parent object, and then push and object containing the source and target for that relationship.
            //
            localRoot.nodes.forEach(function (node) {
                node.parentRelationshipIds.forEach(function (parent) {
                    var parentObj = _.find(localRoot.nodes, function (obj) {
                        return obj._id == parent;
                    });
                    //if there is a parent push the edge/relationship
                    if (node != parentObj) {
                        if (parentObj != undefined) {
                            localRoot.links.push({
                                source: parentObj,
                                target: node,
                                visible: true,
                                highlighted: false,
                                textHighlighted: true
                            });
                        }
                        // add the references to those object for later usage to the objects themselves.
                        if (parentObj != undefined) {
                            parentObj.children.push(node);
                            node.parents.push(parentObj);
                        }


                    }
                })
            })
        }

        function removeBadRelationships() {
            _.each(localRoot.nodes, function (node) {
                _.each(node.children, function (child) {
                    var gat = _.includes(child.children, node)
                    if (gat) {
                        circularRef.push({
                            duplicate: node,
                            node: child
                        })
                    }
                })
            });
            _.each(circularRef, function (o) {
                var _children = _.reject(o.node.children, function (child) {
                    return child._id == o.duplicate._id;
                });
                var _parents = _.reject(o.duplicate.parents, function (parent) {
                    return parent._id == o.node._id;
                });
                if (!(o.node.type == "root")) {
                    localRoot.links = _.reject(localRoot.links, function (link) {
                        return (link.source == o.node && link.target == o.duplicate);
                    });
                }


                o.duplicate.parents = _parents;
                o.node.children = _children;


            });
        }

        processNodes(sceneList.nodeList);
        processsEdges();
        removeBadRelationships();

        this.setState({
            root: localRoot,
            sceneList: sceneList,
            guid: hat(),
            type: sceneList.type,
            previousGraphId: this.state.graphId
        });
    },
    _getGraphTypeComponent() {
        if (this.state.sceneList) {
            switch (this.state.type) {
                case GraphTypes.MEMOIR:
                    return (
                        <MemoirGraph
                            shouldUpdateId={this.state.guid}
                            data={this.state.root}
                            innerWidth={this.state.width * 0.8}
                            innerHeight={this.state.height * 0.6}

                        />);
                    break;
                case GraphTypes.NARM:
                    return (
                        <NarmGraph
                            shouldUpdateId={this.state.guid}
                            data={this.state.root}
                            innerWidth={this.state.width * 0.8}
                            innerHeight={this.state.height * 0.6}
                        />
                    );
                    break;
                case GraphTypes.GDC:
                    return (<GDCGraph
                        shouldUpdateId={this.state.guid}
                        data={this.state.root}
                        titleHandler={this.titleHandler}
                        fullWidth={this.state.width}
                        fullHeight={this.state.height}
                        innerWidth={this.state.width * 0.8}
                        innerHeight={this.state.height * 0.6}
                    />);
                    break;
                case GraphTypes.THUMBNAIL:
                    return (<ThumbGraph shouldUpdateId={this.state.guid}
                                        data={this.state.root}
                                        sceneList={this.state.sceneList}
                                        innerWidth={this.state.width * 0.8}
                                        innerHeight={this.state.height * 0.6}
                                        fullWidth={this.state.width}
                                        fullHeight={this.state.height}/>);
                    break;
                case GraphTypes.CERAMIC:
                    return (
                        <CeramicGraph
                            shouldUpdateId={this.state.guid}
                            data={this.state.root}
                            innerWidth={this.state.width}
                            innerHeight={this.state.height}>
                        </CeramicGraph>
                    );
                    break;
                case GraphTypes.SOUND:
                    return (
                        <SoundGui  shouldUpdateId={this.state.guid}
                                   data={this.state.sceneList}
                                   innerWidth={this.state.width}
                                   innerHeight={this.state.height}/>


                    );
                case undefined:
                    return (
                        <GDCGraph
                            shouldUpdateId={this.state.guid}
                            titleHandler={this.titleHandler}
                            data={this.state.root}
                            fullWidth={this.state.width}
                            fullHeight={this.state.height}
                            innerWidth={this.state.width * 0.8}
                            innerHeight={this.state.height * 0.6}
                        />
                    );
                    break;
            }

        }
        else {
            return null;
        }

    },

    getQueryVariable() {
        return this.props.location
    },

    componentDidMount: function () {
        document.addEventListener('keyup', this.optionsMenuHandler, false);
        var dom = ReactDom.findDOMNode(this);
      /*  SceneGraphListStore.addChangeListener(this._onChange);*/
        SceneGraphStore.addChangeListener(this._onSceneChange);
        BreadcrumbsStore.addChangeListener(this._onCrumbsChange);
        BreadcrumbsStore.setBreadcrumbs(this.state.graphId);
        GridStore.setRoomId(connectionCache.getSocketID());
        this.setState({height: dom.parentElement.clientHeight, width: dom.parentElement.clientWidth})
    },
    componentWillReceiveProps: function (nextProps) {
        var queryId;

        queryId = nextProps._id;
        if (queryId != this.state.previousGraphId) {
            HubSendActions.getSceneGraphByID(queryId);
            BreadcrumbsStore.setBreadcrumbs(queryId);
            this.setState({graphId: queryId, guid: hat()})
        }
        var dom = ReactDom.findDOMNode(this);
        this.setState({height: dom.parentElement.clientHeight, width: dom.parentElement.clientWidth, guid: hat()})
    },
    componentWillUnmount: function () {
        document.removeEventListener('keyup', this.optionsMenuHandler, false);
   /*     SceneGraphListStore.removeChangeListener(this._onChange);*/
        SceneGraphStore.removeChangeListener(this._onSceneChange);
        BreadcrumbsStore.removeChangeListener(this._onCrumbsChange);
        GridStore.setRoomId("presentation1");
    },
    autocompleteHandler: function () {
        this.setState({autocompleteToggle: !this.state.autocompleteToggle})
    },
    qrHandler: function () {
        this.setState({QRToggle: !this.state.QRToggle})
    },
    breadcrumbsUpdateHandler: function (updatedCrumbs) {
        localStorage.set(this.state.graphId + " breadcrumbsList", updatedCrumbs);
        this.setState({breadcrumbsList: updatedCrumbs});
    },
    breadcrumbsHandler: function () {
        this.setState({breadcrumbsToggle: !this.state.breadcrumbsToggle})
    },
    autowalkHandler: function () {
        this.setState({autoWalkToggle: !this.state.autoWalkToggle})
    },
    sceneViewerHandler: function () {
        window.open(this.state.viewerURL, "_blank");
    },
    optionsMenuHandler: function (e) {
        if (e.altKey && e.keyCode == 79) {
            this.setState(
                {
                    optionsMenuToggle: !this.state.optionsMenuToggle,
                    autoWalkToggle: false,
                    breadcrumbsToggle: false,
                    QRToggle: false
                })
        }

    },
    cleanTitle: function (title) {
        return title.replace(/([a-z])([A-Z0-9])(?=[a-z])/g, '$1 $2').replace('GUIscene', 'scene').replace(/(scene|chicago|beijing)?\s(.*)?/i, '<sup>$1</sup><span class="$1">$2</span>');
    },
    _getGraphHTML:function(graph){
        var extraSVGClass = "";
        if (this.state.type != undefined) {
            extraSVGClass = this.state.type || "GDC_SCENE_GRAPH";
        }
        if(this.state.sceneList){
            var self =this;
            switch(this.state.type){
                case GraphTypes.SOUND:
                    return (
                        <div ref="graph">
                            <div
                                 width={self.state.width} height={self.state.height}
                            >
                                {graph}
                            </div>
                        </div>
                    );
                case GraphTypes.CERAMIC:
                case GraphTypes.THUMBNAIL:
                case GraphTypes.NARM:
                case GraphTypes.MEMOIR:
                case GraphTypes.GDC:
                    return( <div ref="graph">
                            <h1 className="title" dangerouslySetInnerHTML={{__html: self.cleanTitle(this.state.title)}}></h1>
                            <svg className={"svg-parent " + extraSVGClass}
                                 width={self.state.width} height={self.state.height}
                            >
                                {graph}
                            </svg>
                        </div>
                    )
            }
        }else{
            return <div>Meh</div>
        }
    },
    componentWillMount() {
        var queryId;

        //Is layout properties are now redundant
        if (this.props.isLayout) {
            queryId = this.props._id;
        } else {
            queryId = this.props.location || "589b24e6c9d9c9b81328d7e8";
        }

        HubSendActions.getSceneGraphByID(queryId);

        this.setState({graphId: queryId, guid: hat()})
    },
    render() {
        var self = this;
        var graph = this._getGraphTypeComponent();
        var graphHTML = this._getGraphHTML(graph);
        var qrCodeClasses = classes({
            'qrcode': true,
            'visible': this.state.QRToggle,
            'hidden': !this.state.QRToggle
        });

        var autocompleteClasses = classes({
            'visible': this.state.autocompleteToggle,
            'hidden': !this.state.autocompleteToggle
        });



        var logos = this.state.type == GraphTypes.NARM ? <div>
            <div className={this.state.graphType + "narm-logo"}>
                <img
                    src="/images/salford.png"/>
            </div>
            <div className={this.state.graphType + "narm-logo2"}>
                <img src="/images/narmc.png"/>
            </div>
        </div> : null;
        return (
            <div ref="parent" className="flex-container">

                <div className="button-wrapper btn-group-vertical">
                    <div id="qrcode" className={qrCodeClasses}>
                        <QRCODE value={this.state.viewerURL}></QRCODE>
                    </div>
                </div>

                {graphHTML}
                {/*OPTIONS Menu Item here*/}
                <OptionsMenu
                    optionsMenuToggle={this.state.optionsMenuToggle}
                    autocompleteHandler={this.autocompleteHandler}
                    autowalkHandler={this.autowalkHandler}
                    sceneViewerHandler={this.sceneViewerHandler}
                    breadcrumbsHandler={this.breadcrumbsHandler}
                    qrHandler={this.qrHandler}
                >
                </OptionsMenu>

                {/*Autowalk Item here*/}
                <AutowalkMenu autoWalkToggle={this.state.autoWalkToggle}>

                </AutowalkMenu>
                {/*Crumbs Container here*/}

                <BreadcrumbsMenu breadcrumbsList={this.state.breadcrumbsList.data}
                                 graphId={this.state.graphId}
                                 type={this.state.type}
                                 breadcrumbsToggle={this.state.breadcrumbsToggle}>
                </BreadcrumbsMenu>
                {logos}
            </div>
        );
    }
});

module.exports = GraphContainer;


