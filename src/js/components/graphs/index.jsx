var React = require("react");
var d3 = require("d3");
var TransitionGroup = require('react-transition-group/TransitionGroup');
var SceneGraphListStore = require('../../stores/scene-graph-list-store.jsx');
var HubSendActions = require('../../actions/hub-send-actions');
var connectionCache = require("../../utils/connection-cache");
var NarmGraph = require('./narm-graph.jsx');
var MemoirGraph = require('./memoir-graph.jsx');
var GDCGraph = require('./gdc-graph.jsx');
var BreadcrumbsStore = require('../../stores/breadcrumbs-store');
var QRCODE = require('qrcode.react');
var OptionsMenu = require('./options-menu.jsx');
var BreadcrumbsMenu = require('./breadcrumbs-menu.jsx');
var AutowalkMenu = require('./autowalk-menu.jsx');
var classes = require('classnames');
var _ = require("lodash");
var hat = require("hat");

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
            autocompleteToggle: false,
            breadcrumbsToggle: false,
            autoWalkToggle: false,
            optionsMenuToggle: false,
            guid: null,
            title:""
        }
    },
    _onChange: function () {
        var sceneList = SceneGraphListStore.getSceneGraphByID(this.state.graphId)

        this._initialize(sceneList);

    },
    _onCrumbsChange: function () {
        this.setState({breadcrumbsList: BreadcrumbsStore.getBreadcrumbs()});
    },
    titleHandler:function(title){
      this.setState({title:title})
    },
    _initialize(sceneList){
        var localRoot = {
            nodes: [],
            links: []
        };
        var circularRef = [];

        function processNodes(data) {
            data.forEach(function (obj) {
                obj.x = obj.y = 0;
                obj.cx = window.innerWidth / 2 - window.innerWidth * 0.1;
                obj.cy = window.innerHeight / 2 -  window.innerHeight * 0.2;
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
                            localRoot.links.push({source: parentObj, target: node, visible: true, highlighted: false});
                        }
                        // add the references to those object for later usage to the objects themselves.
                        parentObj.children.push(node);
                        node.parents.push(parentObj);
                    }
                })
            })
        }

        function removeBadRelationships() {
            _.each(localRoot.nodes, function (node) {
                _.each(node.children, function (child) {
                    var gat = _.include(child.children, node)
                    if (gat) {
                        circularRef.push({
                            duplicate: node,
                            node: child
                        })
                    }
                })
            });
            //console.log(circularRef)
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
        this.setState({root: localRoot, sceneList: sceneList,guid:hat()});
    },
    _getGraphTypeComponent(){
        if (this.state.sceneList) {
            switch (this.state.sceneList.type) {
                case "MEMOIR_SCENE_GRAPH":
                    return null;
                    break;
                case "NARM_SCENE_GRAPH":
                    return (
                        <NarmGraph
                            shouldUpdateId={this.state.guid}
                            data={this.state.root}
                            innerWidth={window.innerWidth * 0.8}
                            innerHeight={window.innerHeight * 0.6}
                        />
                    );
                    break;
                case "GDC_SCENE_GRAPH":
                    console.log("GDC Graph", this.state.root)
                    return (<GDCGraph
                        shouldUpdateId={this.state.guid}
                        data={this.state.root}
                        titleHandler={this.titleHandler}
                        fullWidth={window.innerWidth}
                        fullHeight={window.innerHeight}
                        innerWidth={window.innerWidth * 0.8}
                        innerHeight={window.innerHeight * 0.6}
                    />);
                    break;
                case undefined:
                    console.log("GDC Graph undefined", this.state.root)
                    return (
                        <GDCGraph
                            shouldUpdateId={this.state.guid}
                            titleHandler={this.titleHandler}
                            data={this.state.root}
                            fullWidth={window.innerWidth}
                            fullHeight={window.innerHeight}
                            innerWidth={window.innerWidth * 0.8}
                            innerHeight={window.innerHeight * 0.6}
                        />
                    );
                    break;
            }

        }
        else {
            return null;
        }

    },

    getQueryVariable(){
        return this.props.location.query.id
    },
    componentDidMount: function () {
        document.addEventListener('keyup', this.optionsMenuHandler, false);
        SceneGraphListStore.addChangeListener(this._onChange);
        BreadcrumbsStore.addChangeListener(this._onCrumbsChange);
        BreadcrumbsStore.setBreadcrumbs(this.state.graphId);
    },

    componentWillUnmount: function () {
        document.removeChangeListener('keyup', this.optionsMenuHandler, false);
        SceneGraphListStore.removeChangeListener(this._onChange);
        BreadcrumbsStore.removeChangeListener(this._onCrumbsChange);
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
    componentWillMount(){
        var queryId = this.props.location.query.id || "589b24e6c9d9c9b81328d7e8";
        var graphId;
        if (queryId == undefined) {
            graphId = "589b24e6c9d9c9b81328d7e8";
        } else {
            graphId = queryId;
        }

        HubSendActions.getSceneGraphByID(graphId);

        this.setState({graphId: graphId})
    },
    render(){

        var graph = this._getGraphTypeComponent();
        console.log("trying to render", graph, this.state);
        var qrCodeClasses = classes({
            'qrcode': true,
            'visible': this.state.QRToggle,
            'hidden': !this.state.QRToggle
        });

        var autocompleteClasses = classes({
            'visible': this.state.autocompleteToggle,
            'hidden': !this.state.autocompleteToggle
        });

        return (
            <div ref="parent">

                <div className="button-wrapper btn-group-vertical">
                    <button className="btn graph-btn" id="reset-origin">Go Home</button>
                    <div id="qrcode" className={qrCodeClasses}>
                        <QRCODE value={this.state.viewerURL}></QRCODE>
                    </div>
                </div>

                <div ref="graph">
                    <svg viewBox={"0 0 " + window.innerWidth + " " + window.innerHeight } preserveAspectRatio="xMinYMin"
                    >
                        {graph}
                    </svg>
                </div>

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
                 breadcrumbsToggle={this.state.breadcrumbsToggle}>
                 </BreadcrumbsMenu>


                {/*Optional Logos Here*/}
                {/*<div className={graphType + "-logo"}>*/}
                {/*<img*/}
                {/*src="http://www.salford.ac.uk/__data/assets/image/0005/906287/university-of-salford-web-logo-clear-back-113x70.png"/>*/}
                {/*</div>*/}
                {/*<div className={graphType + "-logo2"}>*/}
                {/*<img src="http://salfordmediafestival.co.uk/wp-content/uploads/2014/06/media_conference.png"/>*/}
                {/*</div>*/}
                <h1 className="title" dangerouslySetInnerHTML={{__html:this.cleanTitle(this.state.title)}}></h1>
            </div>
        );
    }
});

module.exports = GraphContainer;


